/// <reference path="../../node_modules/@types/gapi.client/index.d.ts"/>
/// <reference path="../../node_modules/@types/gapi.client.drive/index.d.ts"/>

const config = {
  API_KEY:  "AIzaSyCYdtUSdjMb_fpTquBiHWjLeLL4mZq5c6w",
  CLIENT_ID: "531678471267-3bptmp310eid1diggf9hb395fj7abd3i.apps.googleusercontent.com",
  DISCOVERY_DOCS: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"],
  SCOPES: "https://www.googleapis.com/auth/drive"
};

const DEFAULT_TIMEOUT_MS = 15000;

function createSingletonWithPromise<T>(func: () => Promise<T>): () => Promise<T> {
  var singletonPromise: Promise<T> | undefined;
  return () => {
    if (!singletonPromise) {
      singletonPromise = func();
    }
    return singletonPromise;
  };
}

const loadApiSingleton = (apiName: string, extraCallback?: () => void): () => Promise<void> => {
  return createSingletonWithPromise(() => {
    var promise = new Promise<void>((resolve, reject) => {
      gapi.load(apiName, {
        timeout: DEFAULT_TIMEOUT_MS,
        callback: resolve,
        onerror: () => reject("gapi failed to load api: " + apiName),
        ontimeout: () => reject("gapi timed out loading api: " + apiName)
      });
    });
    if (extraCallback) {
      promise = promise.then(extraCallback);
    }
    return promise;
  });
};

var authIsLoaded = false;

const loadClientAuth2ApiSingleton = loadApiSingleton("client:auth2", () => authIsLoaded = true);

export const clientSingleton = createSingletonWithPromise(() => {
  return loadClientAuth2ApiSingleton().then(() => {
    gapi.client.init({
      apiKey: config.API_KEY,
      clientId: config.CLIENT_ID,
      discoveryDocs: config.DISCOVERY_DOCS,
      scope: config.SCOPES
    });
  });
});

export const filesSingleton = createSingletonWithPromise(() => {
  return (
    clientSingleton()
      .then(() => gapi.client.load("drive", "v3"))
      .then(() => {
        // hack because the typings seem to be wrong
        (<any> (gapi.client)).files = (<any> (gapi.client)).drive.files;
        return gapi.client.files;
      })
  );
});

export function getAuthInstance() {
  if (!authIsLoaded) {
    throw new Error("gapi auth2 api not yet loaded");
  }
  return gapi.auth2.getAuthInstance();
}

export type BasicProfile = gapi.auth2.BasicProfile;
export type DriveFile = gapi.client.drive.File;
export type DriveFilesResource = gapi.client.drive.FilesResource;
