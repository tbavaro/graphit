/// <reference path="../../node_modules/@types/gapi.client/index.d.ts"/>
/// <reference path="../../node_modules/@types/gapi.client.drive/index.d.ts"/>

const config = {
  API_KEY:  "AIzaSyCYdtUSdjMb_fpTquBiHWjLeLL4mZq5c6w",
  CLIENT_ID: "531678471267-3bptmp310eid1diggf9hb395fj7abd3i.apps.googleusercontent.com",
  DISCOVERY_DOCS: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"],
  SCOPES: "https://www.googleapis.com/auth/drive"
};

var clientSingletonPromise: Promise<void> | undefined;

function clientSingleton(): Promise<void> {
  if (!clientSingletonPromise) {
    clientSingletonPromise = gapi.client.init({
      apiKey: config.API_KEY,
      clientId: config.CLIENT_ID,
      discoveryDocs: config.DISCOVERY_DOCS,
      scope: config.SCOPES
    });
    return clientSingletonPromise;
  } else {
    return clientSingletonPromise;
  }
}

const GoogleApi = {
  clientSingleton: clientSingleton,
  gapiRaw: gapi
};

export default GoogleApi;
