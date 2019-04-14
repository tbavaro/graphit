
import * as QueryString from "query-string";
import * as React from "react";

// import "App.css";
import { Datastore, DatastoreStatus } from "../data/Datastore";
import { GraphDocument } from "../data/GraphDocument";
import { SimpleListenable } from "../data/Listenable";
import * as SimulationViewport from "../ui-structure/SimulationViewport";

import * as AppBar from "./ui-helpers/AppBar";

export type AllActions = AppBar.Actions;

interface State {
  document: GraphDocument | null;
  loadedDocumentId?: string; // TODO move into GraphDocument?
  modalOverlayText?: string;
  canSaveDocument: boolean;
  leftNavOpen: boolean;
  propertiesViewOpen: boolean;
  activeDialog?: any;

  // these shouldn't be interacted with directly, but rather through get/set methods
  _documentIsDirty: boolean;
}

class App extends React.Component<object, State> {
  private datastore = new Datastore();

  private simulationConfigListener = (() => {
    const listener = new SimpleListenable();
    listener.addListener("changed", () => { this.markDocumentDirty(); });
    return listener;
  })();

  public state: State = {
    document: null,
    leftNavOpen: false,
    propertiesViewOpen: false,
    canSaveDocument: false,
    modalOverlayText: "Loading...",
    _documentIsDirty: false
  };

  private pendingDocumentLoadId?: string;

  private actionManager: AllActions = {
    togglePropertiesView: () => {
      this.setState({
        propertiesViewOpen: !this.state.propertiesViewOpen
      });
    }
  };

  private oldWindowOnBeforeUnload: any | null = null;

  public componentWillMount() {
    this.datastore.addListener("status_changed", this.onDatastoreStatusChanged);
    this.onDatastoreStatusChanged();

    const queryParams = QueryString.parse(location.search);
    let documentId: string | null = null;
    if (queryParams.doc instanceof Array && queryParams.doc.length >= 1) {
      documentId = queryParams.doc[0];
    } else if (typeof queryParams.doc === "string") {
      documentId = queryParams.doc;
    }
    if (documentId) {
      this.loadDocumentById(documentId);
    } else {
      this.setState({
        leftNavOpen: true
      });
      this.hideModalOverlay();
    }

    this.oldWindowOnBeforeUnload = window.onbeforeunload;
    window.onbeforeunload = this.onBeforeUnload;
  }

  public componentWillUnmount() {
    this.datastore.removeListener("status_changed", this.onDatastoreStatusChanged);
    if (window.onbeforeunload === this.onBeforeUnload) {
      window.onbeforeunload = this.oldWindowOnBeforeUnload;
    }
    this.oldWindowOnBeforeUnload = null;
  }

  public render() {
    // TODO consider triggering this only when needed
    this.updateWindowTitle();

    let viewportView: any;
    let title: string = "GraphIt";

    if (this.state.document !== null) {
      title = this.state.document.name;
      viewportView = (
        <SimulationViewport.Component
          document={this.state.document}
          simulationConfigListener={this.simulationConfigListener}
          onChange={this.markDocumentDirty}
        />
      );
    } else {
      viewportView = <div className="App-empty"/>;
    }

    return (
      <div className="App">
        <AppBar.Component
          title={title}
          onClickNavButton={this.openLeftNav}
          actionManager={this.actionManager}
          isDocumentLoaded={!!this.state.document}
        />
        <div className="App-content">
          {viewportView}
        </div>
        {this.state.modalOverlayText ? this.renderModalOverlay(this.state.modalOverlayText) : null}
        {this.state.activeDialog}
      </div>
    );
  }

  private onDatastoreStatusChanged = () => {
    if (this.datastore.status() !== DatastoreStatus.Initializing) {
      // assume we can't save it; we'll check in just a sec
      this.setState({ canSaveDocument: false });

      if (this.pendingDocumentLoadId) {
        const id = this.pendingDocumentLoadId;
        this.pendingDocumentLoadId = undefined;
        this.loadDocumentById(id);
      } else if (this.state.loadedDocumentId) {
        const id = this.state.loadedDocumentId;
        this.datastore.canSave(id).then((canSave) => {
          // if another doc was loaded in the meantime then nevermind
          if (id === this.state.loadedDocumentId) {
            this.setState({ canSaveDocument: canSave });
          }
        });
      }
    }
    this.forceUpdate();
  }

  private onBeforeUnload = () => {
    if (this.isDocumentDirty()) {
      // NB: most modern browsers don't actually show this specific text,
      // but returning *something* makes it prompt the user before leaving.
      return "There are unsaved changes.";
    } else {
      return undefined;
    }
  }

  private openLeftNav = () => {
    this.setState({
      leftNavOpen: true
    });
  }

  ////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////
  // FULLY MERGED BELOW THIS LINE
  ////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////

  private isDocumentDirty() {
    return this.state.document !== undefined && this.state._documentIsDirty;
  }

  private showModalOverlay = (text: string) => {
    this.setState({ modalOverlayText: text });
  }

  private hideModalOverlay = () => {
    this.setState({ modalOverlayText: undefined });
  }

  private showModalOverlayDuring<T>(text: string, promise: PromiseLike<T>): PromiseLike<T> {
    this.showModalOverlay(text);
    return promise.then(
      (value) => {
        this.hideModalOverlay();
        return value;
      },
      (reason) => {
        this.hideModalOverlay();
        throw reason;
      }
    );
  }

  private decodeErrorReason(reason: any): string {
    if (reason && reason.result && reason.result.error && reason.result.error.errors) {
      const errors = reason.result.error.errors;
      if (errors.length === 1) {
        const onlyError = errors[0];
        if (onlyError.message) {
          return ("" + onlyError.message);
        }
      }
    }
    return JSON.stringify(reason);
  }

  private setDocument = (
    document: GraphDocument,
    documentId: string | undefined,
    canSave: boolean
  ) => {
    this.setState({
      loadedDocumentId: documentId,
      document: document,
      _documentIsDirty: false,
      canSaveDocument: canSave
    });
    this.updateUrlWithDocumentId();
  }

  private updateWindowTitle() {
    window.document.title = [
      this.isDocumentDirty() ? "\u2022 " : "",
      this.state.document === null
        ? ""
        : `${this.state.document.name} - `,
      "GraphIt",
    ].join("");
  }

  private updateUrlWithDocumentId() {
    const documentId = this.state.loadedDocumentId;
    let url: string;

    if (documentId === undefined) {
      url = "?";
    } else {
      const encodedDocumentId = encodeURIComponent(documentId);

      // hack; weird characters at the end of the url (like a hyphen)
      // get past encodeURIComponent but are handled incorrectly by
      // things like slack and asana
      const needsExtraAmpersand = encodedDocumentId.match(/[^A-Za-z0-9]$/);

      url = `?doc=${encodedDocumentId}${needsExtraAmpersand ? "&" : ""}`;
    }

    history.replaceState({}, window.document.title, url);
  }

  private loadDocumentById = (id?: string) => {
    // if the datastore isn't ready yet, don't try to load it yet
    if (this.datastore.status() === DatastoreStatus.Initializing) {
      this.pendingDocumentLoadId = id;
      return;
    }

    if (id === undefined) {
      this.setDocument(GraphDocument.empty(), undefined, false);
      return;
    }

    this.showModalOverlayDuring(
      "Loading...",
      this.datastore.loadFile(id).then(
        (result) => {
          const document = GraphDocument.load(result.content);
          document.name = result.name;
          this.setDocument(document, id, result.canSave);
        },
        (reason) => {
          alert("error loading document:\n" + this.decodeErrorReason(reason));
        }
      )
    );
  }

  private renderModalOverlay(text: string) {
    return (
      <div className="App-modalOverlay">
        <div className="App-modalOverlay-row">
          <div className="App-modalOverlay-text">
            {text}
          </div>
        </div>
      </div>
    );
  }

  private setDocumentIsDirty(value: boolean) {
    // document can never be dirty if there's no document
    value = value && (this.state.document !== undefined);

    // only set the state if it's a change (TODO see if react is smart here)
    if (this.state._documentIsDirty !== value) {
      this.setState({ _documentIsDirty: value });
    }
  }

  private markDocumentDirty = () => this.setDocumentIsDirty(true);
}

export default App;
