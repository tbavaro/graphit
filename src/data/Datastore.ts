import * as GoogleApi from "../google/GoogleApi";
import * as GooglePickerHelper from "../google/GooglePickerHelper";
import { DatastoreStatus } from "./DatastoreStatus";
import { BasicListenable } from "./Listenable";

type Maybe<T> = T | undefined;

export { DatastoreStatus };

export interface DatastoreLoadFileResult<T> {
  id: string;
  name: string;
  content: T;
  canSave: boolean;
}

// function transformLoadFileResult<T, U>(
//   original: DatastoreLoadFileResult<T>,
//   transform: (value: T) => U
// ): DatastoreLoadFileResult<U> {
//   return {
//     id: original.id,
//     name: original.name,
//     content: transform(original.content),
//     canSave: original.canSave
//   };
// }

function isSuccessful(response: ResponseInit) {
  return response.status === undefined || (response.status >= 200 && response.status < 300);
}

export class Datastore extends BasicListenable<"status_changed"> {
  private _status = DatastoreStatus.Initializing;
  private _accessToken?: string;
  private _reloadAccessTokenTimeoutId?: number;
  private _files?: GoogleApi.DriveFilesResource;

  constructor() {
    super();
    GoogleApi.filesSingleton().then((files) => {
      this._files = files;

      // listen for sign-in state changes
      GoogleApi.getAuthInstance().isSignedIn.listen(this.updateIsSignedIn);

      // handle the initial sign-in state
      this.updateIsSignedIn(GoogleApi.getAuthInstance().isSignedIn.get());
    });
  }

  public status() {
    return this._status;
  }

  public signIn() {
    if (this._status === DatastoreStatus.SignedOut) {
      GoogleApi.getAuthInstance().signIn();
    }
  }

  public signOut() {
    if (this.isSignedIn()) {
      GoogleApi.getAuthInstance().signOut();
    }
  }

  public currentUserName(): Maybe<string> {
    return this.maybeGetProfileData(p => p.getName());
  }

  public currentUserEmail(): Maybe<string> {
    return this.maybeGetProfileData(p => p.getEmail());
  }

  public currentUserImageUrl(): Maybe<string> {
    return this.maybeGetProfileData(p => p.getImageUrl());
  }

  private getFileMetadata(fileId: string): PromiseLike<GoogleApi.DriveFile> {
    return this.filesResource().get({
      fileId: fileId,
      fields: "name, capabilities",
      key: GoogleApi.config.API_KEY
    }).then((f) => f.result);
  }

  public async getFileName(fileId: string): Promise<string> {
    const result = await this.getFileMetadata(fileId);
    return result.name || "<untitiled>";
  }

  private addQueryParams(url: string, queryParams: { [k: string]: string }) {
    const queryKeys = Object.keys(queryParams);
    if (queryKeys.length === 0) {
      return url;
    }

    url += (url.includes("?") ? "&" : "?");

    const queryParts = queryKeys.map((key) => {
      const value = ("" + queryParams[key]);
      return encodeURIComponent(key) + "=" + encodeURIComponent(value);
    });

    return url + queryParts.join("&");
  }

  private authHeaders(): Record<string, string> {
    if (this._accessToken) {
      return {
        Authorization: `Bearer ${this._accessToken}`
      };
    } else {
      return {};
    }
  }

  private async loadFileContent(fileId: string): Promise<string> {
    const url = this.addQueryParams(
      "https://www.googleapis.com/drive/v3/files/" + encodeURIComponent(fileId),
      {
        "alt": "media",
        "key": GoogleApi.config.API_KEY
      }
    );

    const options: RequestInit = {
      headers: this.authHeaders()
    }

    const response = await window.fetch(url, options);
    if (!isSuccessful(response)) {
      throw new Error(`error ${response.status}: ${response.statusText}`);
    }

    return response.text();
  }

  private interpretCanSave(metadata: GoogleApi.DriveFile) {
    return metadata.capabilities ? (metadata.capabilities.canEdit || false) : false;
  }

  public canSave(fileId: string): PromiseLike<boolean> {
    return this.getFileMetadata(fileId).then(
      (metadata) => this.interpretCanSave(metadata),
      () => false
    );
  }

  public async loadFile(fileId: string): Promise<DatastoreLoadFileResult<string>> {
    const [metadata, content] = await Promise.all([
      this.getFileMetadata(fileId),
      this.loadFileContent(fileId)
    ]);

    return {
      id: fileId,
      name: metadata.name || "Untitled",
      content: content,
      canSave: this.interpretCanSave(metadata)
    };
  }

  public async saveFileAs(name: string, data: string, mimeType: string): Promise<string> {
    if (!this.isSignedIn()) {
      return Promise.reject(new Error("not logged in"));
    }

    const uri = this.addQueryParams(
      "https://www.googleapis.com/upload/drive/v3/files",
      {
        "uploadType": "multipart",
        "key": GoogleApi.config.API_KEY
      }
    );
    const metadata: GoogleApi.DriveFile = {
      name: name,
      mimeType: mimeType
    };

    const formData = new FormData();
    formData.append(
      "metadata",
      new Blob(
        [JSON.stringify(metadata)],
        { type: "application/json" }
      )
    );
    formData.append(
      "file",
      new Blob(
        [data],
        { type: GooglePickerHelper.GRAPHIT_MIME_TYPE }
      )
    );

    const response = await window.fetch(uri, {
      method: "POST",
      headers: this.authHeaders(),
      body: formData
    });

    if (!isSuccessful(response)) {
      throw new Error(`error saving (${response.status}): ${response.statusText}`);
    }

    const resultData = await response.json();
    if (resultData.id === undefined) {
      throw new Error("didn't receive id");
    }
    return resultData.id;
  }

  public async updateFile(fileId: string, data: string): Promise<void> {
    const uri = this.addQueryParams(
      "https://www.googleapis.com/upload/drive/v3/files/" + encodeURIComponent(fileId),
      {
        "key": GoogleApi.config.API_KEY
      }
    );

    const response = await window.fetch(uri, {
      method: "PATCH",
      headers: this.authHeaders(),
      body: new Blob([data], { type: GooglePickerHelper.GRAPHIT_MIME_TYPE })
    });

    if (!isSuccessful(response)) {
      throw new Error(`error updating (${response.status}): ${response.statusText}`);
    }
  }

  private filesResource() {
    if (!this._files) {
      throw new Error("gapi files not initialized");
    }
    return this._files;
  }

  private isSignedIn() {
    return (this._status === DatastoreStatus.SignedIn);
  }

  private updateIsSignedIn = (newValue: boolean) => {
    const newStatus = (newValue ? DatastoreStatus.SignedIn : DatastoreStatus.SignedOut);
    if (this._status !== newStatus) {
      // clear caches and reload access token timer
      this._accessToken = undefined;
      if (this._reloadAccessTokenTimeoutId) {
        clearTimeout(this._reloadAccessTokenTimeoutId);
        this._reloadAccessTokenTimeoutId = undefined;
      }

      // if newly signed in...
      if (newStatus === DatastoreStatus.SignedIn) {
        this._accessToken = GoogleApi.getAuthInstance().currentUser.get().getAuthResponse().access_token;
        this.scheduleAuthReload();
      }

      // make it official
      this._status = newStatus;
      this.triggerListeners("status_changed");
    }
  }

  private doAuthReload = () => {
    if (this.isSignedIn()) {
      GoogleApi.getAuthInstance().currentUser.get().reloadAuthResponse().then((response) => {
        this._accessToken = response.access_token;
        this.scheduleAuthReload();
      });
    }
  }

  private scheduleAuthReload = () => {
    if (this._reloadAccessTokenTimeoutId) {
      clearTimeout(this._reloadAccessTokenTimeoutId);
      this._reloadAccessTokenTimeoutId = undefined;
    }

    const secondsToExpire = GoogleApi.getAuthInstance().currentUser.get().getAuthResponse().expires_in;
    const secondsToWaitBeforeReload = Math.max(1, secondsToExpire - 120);
    this._reloadAccessTokenTimeoutId = window.setTimeout(this.doAuthReload, secondsToWaitBeforeReload * 1000);
  }

  private maybeGetProfileData<T>(func: (profile: GoogleApi.BasicProfile) => T): Maybe<T> {
    if (this.isSignedIn()) {
      return func(GoogleApi.getAuthInstance().currentUser.get().getBasicProfile());
    } else {
      return undefined;
    }
  }
}
