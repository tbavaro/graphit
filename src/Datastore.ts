/// <reference types="@types/gapi"/>

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
      console.log("init client");
      gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES
      }).then(() => {
        // listen for sign-in state changes
        gapi.auth2.getAuthInstance().isSignedIn.listen(this.updateIsSignedIn);

        // handle the initial sign-in state
        this.updateIsSignedIn(gapi.auth2.getAuthInstance().isSignedIn.get());
      });
    };
    gapi.load("client:auth2", initClient);
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
    if (this._status === DatastoreStatus.SignedIn) {
      gapi.auth2.getAuthInstance().signOut();
    }
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
