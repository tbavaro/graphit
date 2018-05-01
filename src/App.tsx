import * as React from 'react';
import * as SimulationViewport from './SimulationViewport';
import './App.css';
import * as AppBar from './ui-helpers/AppBar';
import * as FilesDrawerView from './FilesDrawerView';
import { GraphDocument } from './data/GraphDocument';
import { Datastore, DatastoreStatus } from "./data/Datastore";
import * as QueryString from "query-string";
import * as PropertiesView from './PropertiesView';
import { SimpleListenable } from './data/Listenable';
import * as GooglePickerHelper from './google/GooglePickerHelper';
import * as LocalFiles from './localfiles/LocalFiles';
import * as SpreadsheetImporter from "./data/SpreadsheetImporter";
import * as MaterialDialog from "./ui-helpers/MaterialDialog";
import * as GraphData from "./data/GraphData";

export type AllActions =
  AppBar.Actions &
  FilesDrawerView.Actions &
  PropertiesView.Actions;

interface State {
  document: GraphDocument | null;
  loadedDocumentId?: string; // TODO move into GraphDocument?
  modalOverlayText?: string;
  canSaveDocument: boolean;
  leftNavOpen: boolean;
  propertiesViewOpen: boolean;
  activeDialog?: any;
}

class App extends React.Component<object, State> {
  datastore = new Datastore();

  simulationConfigListener = new SimpleListenable();

  state: State = {
    document: null,
    leftNavOpen: false,
    propertiesViewOpen: false,
    canSaveDocument: false,
    modalOverlayText: "Loading..."
  };

  pendingDocumentLoadId?: string;

  actionManager: AllActions = {
    closePropertiesView: () => {
      this.setState({
        propertiesViewOpen: false
      });
    },

    togglePropertiesView: () => {
      this.setState({
        propertiesViewOpen: !this.state.propertiesViewOpen
      });
    },

    openFilePicker: () => this.openFile(),
    save: () => this.save(),
    saveAs: () => this.showSaveAsDialog(),
    importUploadedFile: () => this.importUploadedFile(),
    mergeGoogleSheet: () => this.promptForMergeGoogleSheet(),
    viewAsJSON: () => this.viewAsJSON(),
    signIn: () => this.datastore.signIn(),
    signOut: () => this.datastore.signOut()
  };

  componentWillMount() {
    this.datastore.addListener("status_changed", this.onDatastoreStatusChanged);
    this.onDatastoreStatusChanged();

    var queryParams = QueryString.parse(location.search);
    var documentId: string | null = queryParams.doc || null;
    if (documentId) {
      this.loadDocumentById(documentId);
    } else {
      this.setState({
        leftNavOpen: true
      });
      this.hideModalOverlay();
    }
  }

  componentWillUnmount() {
    this.datastore.removeListener("status_changed", this.onDatastoreStatusChanged);
  }

  render() {
    var viewportView: any;
    var propertiesView: any = undefined;
    var title: string = "GraphIt";

    if (this.state.document !== null) {
      title = this.state.document.name;
      viewportView = (
        <SimulationViewport.Component
          document={this.state.document}
          simulationConfigListener={this.simulationConfigListener}
        />
      );
      propertiesView = (
        <PropertiesView.Component
          actionManager={this.actionManager}
          isOpen={this.state.propertiesViewOpen}
          document={this.state.document}
          simulationConfigListener={this.simulationConfigListener}
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
        <FilesDrawerView.Component
          actionManager={this.actionManager}
          canSave={this.state.canSaveDocument}
          isDocumentLoaded={!!this.state.document}
          isOpen={this.state.leftNavOpen}
          onClosed={this.closeLeftNav}
          datastoreStatus={this.datastore.status()}
          currentUserImageUrl={this.datastore.currentUserImageUrl()}
          currentUserName={this.datastore.currentUserName()}
        />
        <div className="App-content">
          {viewportView}
          {propertiesView}
        </div>
        {this.state.modalOverlayText ? this.renderModalOverlay(this.state.modalOverlayText) : null}
        {this.state.activeDialog}
      </div>
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
          var document = GraphDocument.load(result.content);
          document.name = result.name;
          this.setDocument(document, id, result.canSave);
        },
        (reason) => {
          alert("error loading document:\n" + this.decodeErrorReason(reason));
        }
      )
    );
  }

  private updateUrlWithDocumentId() {
    let documentId = this.state.loadedDocumentId;
    history.replaceState(
      {},
      window.document.title,
      documentId ? ("?doc=" + documentId) : "?"
    );
  }

  private setDocument = (
    document: GraphDocument,
    documentId: string | undefined,
    canSave: boolean
  ) => {
    this.setState({
      loadedDocumentId: documentId,
      document: document,
      canSaveDocument: canSave
    });
    this.updateUrlWithDocumentId();
  }

  private onDatastoreStatusChanged = () => {
    if (this.datastore.status() !== DatastoreStatus.Initializing) {
      // assume we can't save it; we'll check in just a sec
      this.setState({ canSaveDocument: false });

      if (this.pendingDocumentLoadId) {
        let id = this.pendingDocumentLoadId;
        this.pendingDocumentLoadId = undefined;
        this.loadDocumentById(id);
      } else if (this.state.loadedDocumentId) {
        let id = this.state.loadedDocumentId;
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

  private openLeftNav = () => {
    this.setState({
      leftNavOpen: true
    });
  }

  private closeLeftNav = () => {
    this.setState({
      leftNavOpen: false
    });
  }

  private openFile = () => {
    new GooglePickerHelper.default().createAnythingPicker((fileResult) => {
      if (fileResult.mimeType === GooglePickerHelper.SPREADSHEET_MIME_TYPE) {
        this.importOrMergeGoogleSheet(fileResult, /*shouldMerge=*/false);
      } else {
        this.loadDocumentById(fileResult.id);
        this.closeLeftNav();
      }
    });
  }

  private importUploadedFile() {
    LocalFiles.openLocalFile((result: LocalFiles.FileResult) => {
      var document = GraphDocument.load(result.data, result.name);
      this.setDocument(document, /*documentId=*/undefined, false);
      this.closeLeftNav();
    });
  }

  private promptForMergeGoogleSheet() {
    new GooglePickerHelper.default().createGoogleSheetPicker((fileResult) => {
      this.importOrMergeGoogleSheet(fileResult, /*shouldMerge=*/true);
    });
  }

  private importOrMergeGoogleSheet(fileResult: GooglePickerHelper.FileResult, shouldMerge: boolean) {
    SpreadsheetImporter.loadDocumentFromSheet(fileResult.id).then((serializedDocument) => {
      var document: GraphDocument;
      var documentId: string | undefined;
      if (!shouldMerge || (this.state.document === null)) {
        document = new GraphDocument({
          name: fileResult.name,
          data: GraphData.applyDefaults(serializedDocument)
        });
        documentId = undefined;
      } else {
        document = this.state.document.merge(serializedDocument);
        documentId = this.state.loadedDocumentId;
      }
      this.setDocument(document, documentId, this.state.canSaveDocument);
      this.closeLeftNav();
    });
  }

  private showSaveAsDialog() {
    // alert("save as");
    var name = prompt("Save as", (this.state.document !== null) ? this.state.document.name : "Untitled");
    if (name === null) {
      return;
    }
    name = name.trim();
    if (name === "") {
      alert("empty name");
      return;
    }
    this.saveAs(name);
  }

  private save() {
    if (this.state.document !== null) {
      if (!this.state.loadedDocumentId) {
        alert("can't save document without id (yet)");
        return;
      }

      if (!this.state.canSaveDocument) {
        alert("saving probably won't work due to permissions");
      }

      var data = this.state.document.save();
      this.showModalOverlayDuring(
        "Saving...",
        this.datastore.updateFile(this.state.loadedDocumentId, data).then(
          () => { /* */ },
          (reason) => {
            alert("save failed!\n" + this.decodeErrorReason(reason));
          }
        )
      );
    }
  }

  private saveAs(name: string) {
    if (this.state.document === null) {
      return;
    }

    this.state.document.name = name;
    this.forceUpdate(); // because we changed the name

    var data = this.state.document.save();
    this.showModalOverlayDuring(
      "Saving...",
      this.datastore.saveFileAs(name, data, GooglePickerHelper.GRAPHIT_MIME_TYPE).then(
        (id) => {
          this.setState({
            loadedDocumentId: id,
            canSaveDocument: true
          });
          this.updateUrlWithDocumentId();
          this.closeLeftNav();
        },
        (reason) => {
          alert("save failed!\n" + this.decodeErrorReason(reason));
        }
      )
    );
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
      let errors = reason.result.error.errors;
      if (errors.length === 1) {
        let onlyError = errors[0];
        if (onlyError.message) {
          return ("" + onlyError.message);
        }
      }
    }
    return JSON.stringify(reason);
  }

  private showDialog(props: MaterialDialog.Props) {
    props = { ...props };
    const oldDismissDialog = props.dismissDialog;
    props.dismissDialog = () => {
      this.dismissDialog();
      if (oldDismissDialog) {
        oldDismissDialog();
      }
    };
    this.dismissDialog();
    this.setState({
      activeDialog: React.createElement(MaterialDialog.Component, props)
    });
  }

  private dismissDialog = () => {
    console.log("dismissed");
    this.setState({
      activeDialog: undefined
    });
  }

  private viewAsJSON() {
    let contents = "(no document loaded)";
    let isValid = true;
    if (this.state.document) {
      contents = this.state.document.save();
      try {
        GraphData.validateDocumentV1(JSON.parse(contents));
      } catch (e) {
        alert("e: " + e);
        isValid = false;
      }
    }
    this.showDialog({
      title: "View as JSON (" + (isValid ? "" : "in") + "valid)",
      body: contents,
      preformattedBody: true,
      scrollable: true,
      selectable: true
    });
  }
}

export default App;
