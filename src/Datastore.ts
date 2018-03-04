//// <reference path="../node_modules/@types/gapi/index.d.ts"/>
/// <reference path="../node_modules/@types/gapi.client/index.d.ts"/>
/// <reference path="../node_modules/@types/gapi.client.drive/index.d.ts"/>

// import GraphDocument from './GraphDocument';

const API_KEY = "AIzaSyCYdtUSdjMb_fpTquBiHWjLeLL4mZq5c6w";
const CLIENT_ID = "531678471267-3bptmp310eid1diggf9hb395fj7abd3i.apps.googleusercontent.com";
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];
const SCOPES = 'https://www.googleapis.com/auth/drive.metadata.readonly';

type Maybe<T> = T | undefined;

export enum DatastoreStatus {
  Initializing,
  SignedOut,
  SignedIn
}

export class Datastore {
  onStatusChanged?: (newStatus: DatastoreStatus) => void;

  private _status = DatastoreStatus.Initializing;

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

    var finishInitialization = () => {
      // hack because the typings seem to be wrong
      (<any> (gapi.client)).files = (<any> (gapi.client)).drive.files;

      // listen for sign-in state changes
      gapi.auth2.getAuthInstance().isSignedIn.listen(this.updateIsSignedIn);

      // handle the initial sign-in state
      this.updateIsSignedIn(gapi.auth2.getAuthInstance().isSignedIn.get());
    };

    gapi.load("client:auth2", () => {
      initClient().then(initDrive).then(finishInitialization);
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

  listFilesAsync(callback: (files: string[]) => void) {
    if (!this.isSignedIn()) {
      callback([]);
      return;
    }

    gapi.client.files.list({
      pageSize: 10,
      fields: "nextPageToken, files(id, name)"
    }).then((response) => {
      var result = (response.result.files || []).map(f => f.name || "");
      callback(result);
    });
  }

  private isSignedIn() {
    return (this._status === DatastoreStatus.SignedIn);
  }

  private updateIsSignedIn = (newValue: boolean) => {
    var newStatus = (newValue ? DatastoreStatus.SignedIn : DatastoreStatus.SignedOut);
    if (this._status !== newStatus) {
      this._status = newStatus;
      if (this.onStatusChanged) {
        this.onStatusChanged(newStatus);
      }
    }
  }
}
