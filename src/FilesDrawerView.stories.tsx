import { storiesOf } from "@storybook/react";

import { DatastoreStatus } from "./data/DatastoreStatus";
import * as FilesDrawerView from "./FilesDrawerView";
import * as helpers from "./helpers.stories";

const DEFAULT_PROPS: FilesDrawerView.Props = {
  actionManager: helpers.stubActionManager,
  canSave: false,
  isDocumentLoaded: false,
  datastoreStatus: DatastoreStatus.SignedIn,
  currentUserImageUrl:
    "https://lh6.googleusercontent.com/-NRNi9YFDWmE/AAAAAAAAAAI/AAAAAAAAucE/GrDJBb4iXO0/s96-c/photo.jpg",
  currentUserName: "User Name",
  isOpen: true
};

const addVariation = helpers.createVariations({
  storyGroup: storiesOf("FilesDrawerView", module),
  componentClass: FilesDrawerView.Component,
  defaultProps: DEFAULT_PROPS
});

// initializing
addVariation("initializing", {
  datastoreStatus: DatastoreStatus.Initializing
});

// logged out
addVariation("logged out", {
  datastoreStatus: DatastoreStatus.SignedOut
});

// logged in
addVariation("logged in; no document", {});
addVariation("logged in; document", {
  canSave: true,
  isDocumentLoaded: true
});
addVariation("logged in; read-only document", {
  canSave: false,
  isDocumentLoaded: true
});
