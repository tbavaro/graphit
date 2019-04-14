import CssBaseline from "@material-ui/core/CssBaseline";
import * as QueryString from "query-string";
import * as React from "react";

import "./App.css";

import { Datastore, DatastoreStatus } from "./data/Datastore";
import * as GraphData from "./data/GraphData";
import { GraphDocument } from "./data/GraphDocument";
import { SimpleListenable } from "./data/Listenable";
import * as SpreadsheetImporter from "./data/SpreadsheetImporter";
import * as GooglePickerHelper from "./google/GooglePickerHelper";
import MyAppRoot, { MyAppRootInner } from "./ui-structure/MyAppRoot";
import NavDrawerContents from "./ui-structure/NavDrawerContents";
import PropertiesDrawerContents from "./ui-structure/PropertiesDrawerContents";
import * as SimulationViewport from "./ui-structure/SimulationViewport";

import ActionManager from "./ActionManager";

interface State {
  canSaveDocument: boolean;
  datastoreStatus: DatastoreStatus;
  document: GraphDocument | null,
  documentIsDirty: boolean;
  loadedDocumentId: string | null; // TODO move into GraphDocument?
  modalOverlayText: string | null;
}

class App extends React.Component<{}, State> {
  public state: State = {
    canSaveDocument: false,
    datastoreStatus: DatastoreStatus.Initializing,
    document: null,
    documentIsDirty: false,
    loadedDocumentId: null,
    modalOverlayText: "Loading..."
  };

  private pendingDocumentLoadId: string | null = null;

  private datastore = new Datastore();
  private simulationConfigListener = (() => {
    const listener = new SimpleListenable();
    listener.addListener("changed", () => { this.markDocumentDirty(); });
    return listener;
  })();

  public componentWillMount() {
    if (super.componentWillMount) {
      super.componentWillMount();
    }
    this.datastore.addListener("status_changed", this.onDatastoreStatusChanged);
    this.onDatastoreStatusChanged();

    // open doc if its id is specified in the url query params
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
      // TODO in the old version this would automatically open the left nav
      this.hideModalOverlay();
    }
  }

  public componentWillUnmount() {
    if (super.componentWillUnmount) {
      super.componentWillUnmount();
    }
    this.datastore.removeListener("status_changed", this.onDatastoreStatusChanged);
  }

  public render() {
    // TODO consider triggering this only when needed
    this.updateWindowTitle();

    const navDrawerContents = (
      <NavDrawerContents
        actions={this.actionManager}
        canSave={this.state.canSaveDocument}
        datastoreStatus={this.datastore.status()}
        currentUserImageUrl={this.datastore.currentUserImageUrl()}
        currentUserName={this.datastore.currentUserName()}
    />
    );

    const propertiesDrawerContents = (
      <PropertiesDrawerContents
        document={this.state.document}
        simulationConfigListener={this.simulationConfigListener}
      />
    );

    return (
      <React.Fragment>
        <CssBaseline/>
        <MyAppRoot
          leftDrawerChildren={navDrawerContents}
          rightDrawerChildren={propertiesDrawerContents}
          title={(this.state.document && this.state.document.name) || "GraphIt"}
          innerRef={this.setAppRootRef}
        >
          {this.renderBody()}
        </MyAppRoot>
        {
          this.state.modalOverlayText !== null
            ? this.renderModalOverlay(this.state.modalOverlayText)
            : null
        }
      </React.Fragment>
    );
  }

  private renderBody() {
    if (this.state.document === null) {
      return (
        <div id="content" className="App-content"/>
      );
    } else {
      return (
        <SimulationViewport.Component
          document={this.state.document}
          simulationConfigListener={this.simulationConfigListener}
          onChange={this.markDocumentDirty}
        />
      );
    }
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

  private onDatastoreStatusChanged = () => {
    const newStatus = this.datastore.status();
    this.setState({ datastoreStatus: newStatus });
    if (newStatus !== DatastoreStatus.Initializing && this.pendingDocumentLoadId !== null) {
      const documentId = this.pendingDocumentLoadId;
      this.pendingDocumentLoadId = null;
      this.loadDocumentById(documentId);
    }
  }

  // hacks to interact with drawer state; maybe not worth it?
  private appRootRef?: MyAppRootInner;
  private setAppRootRef = (newRef: MyAppRootInner) => {
    this.appRootRef = newRef;
  }
  private closeLeftDrawer = () => {
    if (this.appRootRef) {
      this.appRootRef.closeLeftDrawer();
    }
  };

  // load documents
  private loadDocumentById = (id: string | null) => {
    if (this.datastore.status() === DatastoreStatus.Initializing) {
      this.pendingDocumentLoadId = id;
      return;
    }

    if (id === null) {
      this.setDocument(GraphDocument.empty(), null, false);
      this.closeLeftDrawer();
    } else {
      this.showModalOverlayDuring(
        "Loading...",
        this.datastore.loadFile(id).then(
          (result) => {
            const document = GraphDocument.load(result.content);
            document.name = result.name;
            this.setDocument(document, id, result.canSave);
            this.closeLeftDrawer();
          },
          (reason) => {
            alert("error loading document:\n" + this.decodeErrorReason(reason));
          }
        )
      );
    }
  }

  private setDocument = (
    document: GraphDocument,
    documentId: string | null,
    canSave: boolean
  ) => {
    this.setState({
      loadedDocumentId: documentId,
      document: document,
      documentIsDirty: false,
      canSaveDocument: canSave
    });
    this.updateUrlWithDocumentId();
    // alert("loaded document:\n" + JSON.stringify(document, null, 2));
  }

  private updateUrlWithDocumentId() {
    const documentId = this.state.loadedDocumentId;
    let url: string;

    if (documentId === null) {
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

  private async showModalOverlayDuring<T>(text: string, promise: PromiseLike<T>): Promise<T> {
    this.showModalOverlay(text);
    try {
      const result: T = await promise;
      this.hideModalOverlay();
      return result;
    } catch (reason) {
      this.hideModalOverlay();
      throw reason;
    }
  }

  private showModalOverlay = (text: string) => {
    this.setState({ modalOverlayText: text });
  }

  private hideModalOverlay = () => {
    this.setState({ modalOverlayText: null });
  }

  private decodeErrorReason(reason: any): string {
    if (reason instanceof Error) {
      return reason.message;
    } else if (reason && reason.result && reason.result.error && reason.result.error.errors) {
      const errors = reason.result.error.errors;
      if (errors.length === 1) {
        const onlyError = errors[0];
        if (onlyError.message) {
          return ("" + onlyError.message);
        }
      }
    }
    return JSON.stringify({ reason: reason });
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

  private isDocumentDirty() {
    return this.state.document !== undefined && this.state.documentIsDirty;
  }

  private setDocumentIsDirty(value: boolean) {
    // document can never be dirty if there's no document
    value = value && (this.state.document !== undefined);

    // only set the state if it's a change (TODO see if react is smart here)
    if (this.state.documentIsDirty !== value) {
      this.setState({ documentIsDirty: value });
    }
  }

  private markDocumentDirty = () => this.setDocumentIsDirty(true);
  private markDocumentClean = () => this.setDocumentIsDirty(false);

  private importOrMergeGoogleSheet = (fileResult: GooglePickerHelper.FileResult, shouldMerge: boolean) => {
    this.showModalOverlayDuring(
      shouldMerge ? "Merging..." : "Loading...",
      SpreadsheetImporter.loadDocumentFromSheet(fileResult.id).then((serializedDocument) => {
        let document: GraphDocument;
        let documentId: string | null;
        let merged: boolean;
        let canSave: boolean;
        if (!shouldMerge || (this.state.document === null)) {
          document = new GraphDocument({
            name: fileResult.name,
            data: GraphData.applyDefaults(serializedDocument)
          });
          documentId = null;
          merged = false;
          canSave = false;
        } else {
          document = this.state.document.merge(serializedDocument);
          documentId = this.state.loadedDocumentId;
          merged = true;
          canSave = this.state.canSaveDocument;
        }
        this.setDocument(document, documentId, canSave);
        if (merged) {
          this.markDocumentDirty();
        }
        this.closeLeftDrawer();
      })
    )
  }

  private save = () => {
    if (this.state.document !== null) {
      if (!this.state.loadedDocumentId) {
        alert("can't save document without id (yet)");
        return;
      }

      if (!this.state.canSaveDocument) {
        alert("saving probably won't work due to permissions");
      }

      const data = this.state.document.save();
      this.showModalOverlayDuring(
        "Saving...",
        this.datastore.updateFile(this.state.loadedDocumentId, data).then(
          () => {
            this.markDocumentClean();
          },
          (reason) => {
            alert("save failed!\n" + this.decodeErrorReason(reason));
          }
        )
      );
    }
  }

  private showSaveAsDialog = () => {
    let name = prompt("Save as", (this.state.document !== null) ? this.state.document.name : "Untitled");
    if (name === null) {
      return;
    }
    name = name.trim();
    if (name === "") {
      alert("empty name");
      return;
    }

    if (this.state.document === null) {
      return;
    }

    this.state.document.name = name;
    this.forceUpdate(); // because we changed the name

    const data = this.state.document.save();
    this.showModalOverlayDuring(
      "Saving...",
      this.datastore.saveFileAs(name, data, GooglePickerHelper.GRAPHIT_MIME_TYPE).then(
        (id) => {
          this.setState({
            loadedDocumentId: id,
            canSaveDocument: true
          });
          this.markDocumentClean();
          this.updateUrlWithDocumentId();
          this.closeLeftDrawer();
        },
        (reason) => {
          alert("save-as failed!\n" + this.decodeErrorReason(reason));
        }
      )
    );
  };

  private actionManager = new ActionManager(this.datastore, {
    loadDocumentById: this.loadDocumentById,
    importOrMergeGoogleSheet: this.importOrMergeGoogleSheet,
    save: this.save,
    saveAs: this.showSaveAsDialog
  });
}

export default App;
