/// <reference path="../../node_modules/@types/gapi.client/index.d.ts"/>
/// <reference path="../../node_modules/@types/gapi.client.drive/index.d.ts"/>
/// <reference path="../../node_modules/@types/gapi.client.sheets/index.d.ts"/>
/// <reference path="../../node_modules/@types/google.picker/index.d.ts"/>

export const config = {
  API_KEY: process.env.REACT_APP_GOOGLE_API_KEY,
  CLIENT_ID: process.env.REACT_APP_GOOGLE_CLIENT_ID,
  DISCOVERY_DOCS: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"],
  SCOPES: [
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/spreadsheets.readonly"
  ].join(" ")
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
const loadPickerApiSingleton = loadApiSingleton("picker");

// the @types seem to be wrong here
type ExtraClientTypes = {
  drive: {
    files: typeof gapi.client.files;
  };
  sheets: {
    spreadsheets: typeof gapi.client.spreadsheets;
  }
};

export const clientSingleton = createSingletonWithPromise(() => {
  return loadClientAuth2ApiSingleton().then(() => {
    gapi.client.init({
      apiKey: config.API_KEY,
      clientId: config.CLIENT_ID,
      discoveryDocs: config.DISCOVERY_DOCS,
      scope: config.SCOPES
    });
  }).then(() => {
    return gapi.client as (ExtraClientTypes & typeof gapi.client);
  });
});

export const filesSingleton = createSingletonWithPromise(() => {
  return (
    clientSingleton()
      .then((Client) => {
        return gapi.client.load("drive", "v3").then(() => {
          return Client.drive.files;
        });
      })
  );
});

// the @types seem to be wrong here
type ExtraPickerTypes = {
  DocsView: {
    new (): google.picker.DocsView & {
      setMimeTypes(mimeTypes: string): void;
    };
  };
};

export const pickerSingleton = createSingletonWithPromise(() => {
  return loadPickerApiSingleton().then(() => {
    return google.picker as (ExtraPickerTypes & typeof google.picker);
  });
});

export function getAuthInstance() {
  if (!authIsLoaded) {
    throw new Error("gapi auth2 api not yet loaded");
  }
  return gapi.auth2.getAuthInstance();
}

export const sheetsSingleton = createSingletonWithPromise(() => {
  return (
    clientSingleton()
      .then((Client) => {
        return gapi.client.load("sheets", "v4").then(() => Client.sheets.spreadsheets);
      })
  );
});

export type BasicProfile = gapi.auth2.BasicProfile;
export type DriveFile = gapi.client.drive.File;
export type DriveFilesResource = gapi.client.drive.FilesResource;
