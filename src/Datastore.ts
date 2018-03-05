//// <reference path="../node_modules/@types/gapi/index.d.ts"/>
/// <reference path="../node_modules/@types/gapi.client/index.d.ts"/>
/// <reference path="../node_modules/@types/gapi.client.drive/index.d.ts"/>

// import GraphDocument from './GraphDocument';

import * as Request from "request-promise-native";

const API_KEY = "AIzaSyCYdtUSdjMb_fpTquBiHWjLeLL4mZq5c6w";
const CLIENT_ID = "531678471267-3bptmp310eid1diggf9hb395fj7abd3i.apps.googleusercontent.com";
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];
const SCOPES = 'https://www.googleapis.com/auth/drive';

type Maybe<T> = T | undefined;

export enum DatastoreStatus {
  Initializing,
  SignedOut,
  SignedIn
}

export interface DatastoreFileResult {
  id: string;
  name: string;
}

export class Datastore {
  onStatusChanged?: (newStatus: DatastoreStatus) => void;

  private _status = DatastoreStatus.Initializing;
  private _cachedGraphitRoot?: string | null;
  private _accessToken?: string;
  private _reloadAccessTokenTimeoutId?: NodeJS.Timer;

  constructor() {
    var initClient = () => {
      return gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES
      });
    };

    var initDrive = () => {
      return gapi.client.load("drive", "v3");
    };

    var doHack = () => {
      // hack because the typings seem to be wrong
      (<any> (gapi.client)).files = (<any> (gapi.client)).drive.files;
    };

    var finishInitialization = () => {

      // listen for sign-in state changes
      gapi.auth2.getAuthInstance().isSignedIn.listen(this.updateIsSignedIn);

      // handle the initial sign-in state
      this.updateIsSignedIn(gapi.auth2.getAuthInstance().isSignedIn.get());
    };

    gapi.load("client:auth2", () => {
      initClient()
        .then(initDrive)
        .then(doHack)
        .then(finishInitialization);
    });
  }

  // load(): Maybe<string> {
  //   return undefined;
  // }

  // save(document: string) {
  //   return "hello";
  // }

  loadString(key: string): Maybe<string> {
    return undefined;
  }

  saveString(key: string, value: string) {
    //
  }

  status() {
    return this._status;
  }

  signIn() {
    if (this._status === DatastoreStatus.SignedOut) {
      gapi.auth2.getAuthInstance().signIn();
    }
  }

  signOut() {
    if (this.isSignedIn()) {
      gapi.auth2.getAuthInstance().signOut();
    }
  }

  currentUserEmail(): Maybe<String> {
    if (this.isSignedIn()) {
      return gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile().getEmail();
    } else {
      return undefined;
    }
  }

  listFiles(): PromiseLike<DatastoreFileResult[]> {
    if (!this.isSignedIn()) {
      return Promise.resolve([]);
    }

    var extension = ".graphit.json";

    return this.findOrCreateGraphitRoot()
      .then((rootId) => {
        return gapi.client.files.list({
          pageSize: 1000,
          fields: "nextPageToken, files(id, name)",
          q: "name contains \"" + extension + "\" and \"" + rootId + "\" in parents",
          orderBy: "name"
        }).then((response) => {
          return (response.result.files || []).filter(f => {
            return f.name && f.name.endsWith(extension);
          }).map(f => {
            if (!f.name || !f.id) {
              throw new Error("name or id missing");
            }

            return {
              id: f.id,
              name: f.name.substring(0, f.name.length - extension.length)
            };
          });
        });
      });
  }

  loadFile(fileId: string): PromiseLike<string> {
    if (!this.isSignedIn()) {
      return Promise.reject(new Error("not logged in"));
    }

    var url = "https://www.googleapis.com/drive/v3/files/" + fileId + "?alt=media";
    return Request.get(url, {
      headers: {
        "Authorization": "Bearer " + this._accessToken
      }
    });
  }

  private isSignedIn() {
    return (this._status === DatastoreStatus.SignedIn);
  }

  private updateIsSignedIn = (newValue: boolean) => {
    var newStatus = (newValue ? DatastoreStatus.SignedIn : DatastoreStatus.SignedOut);
    if (this._status !== newStatus) {
      // clear caches and reload access token timer
      this._cachedGraphitRoot = undefined;
      this._accessToken = undefined;
      if (this._reloadAccessTokenTimeoutId) {
        clearTimeout(this._reloadAccessTokenTimeoutId);
        this._reloadAccessTokenTimeoutId = undefined;
      }

      // if newly signed in...
      if (newStatus === DatastoreStatus.SignedIn) {
        this._accessToken = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token;
        this.scheduleAuthReload();
      }

      // make it official
      this._status = newStatus;
      if (this.onStatusChanged) {
        this.onStatusChanged(newStatus);
      }
    }
  }

  private doAuthReload = () => {
    if (this.isSignedIn()) {
      gapi.auth2.getAuthInstance().currentUser.get().reloadAuthResponse().then((response) => {
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

    var secondsToExpire = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().expires_in;
    var secondsToWaitBeforeReload = Math.max(1, secondsToExpire - 120);
    this._reloadAccessTokenTimeoutId = setTimeout(this.doAuthReload, secondsToWaitBeforeReload * 1000);
  }

  private findSingleResult(query: string): PromiseLike<gapi.client.drive.File | null> {
    if (!this.isSignedIn()) {
      return Promise.resolve(null);
    }

    return gapi.client.files.list({
      pageSize: 2,
      fields: "files(id, name)",
      q: query
    }).then((response): gapi.client.drive.File | null => {
      if (response.result.incompleteSearch || (response.result.files && response.result.files.length > 1)) {
        throw new Error("found more than one result for query: " + query);
      } else if (!response.result.files || response.result.files.length === 0) {
        // no results
        return null;
      } else {
        return response.result.files[0];
      }
    });
  }

  private findGraphitRoot = (): PromiseLike<string | null> => {
    if (this._cachedGraphitRoot) {
      return Promise.resolve(this._cachedGraphitRoot);
    }

    var query = [
      'name="graphit"',
      '"root" in parents',
      'mimeType="application/vnd.google-apps.folder"'
    ].join(" and ");
    return this.findSingleResult(query).then((file) => {
      this._cachedGraphitRoot = (file === null ? null : (file.id || null));
      return this._cachedGraphitRoot;
    });
  }

  private findOrCreateGraphitRoot = (): PromiseLike<string> => {
    if (!this.isSignedIn()) {
      return Promise.reject(new Error("not signed in"));
    }

    return this.findGraphitRoot().then((idOrNull: string | null) => {
      if (idOrNull === null) {
        throw new Error("create root not implemented yet");
      }
      return idOrNull;
    });
  }
}
