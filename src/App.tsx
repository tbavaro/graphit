import * as React from 'react';
import SimulationViewport from './SimulationViewport';
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

type AllActions =
  AppBar.Actions &
  FilesDrawerView.Actions &
  PropertiesView.Actions;

interface State {
  document: GraphDocument | null;
  loadedDocumentId?: string; // TODO move into GraphDocument?
  isLoading: boolean;
  canSaveDocument: boolean;
  leftNavOpen: boolean;
  propertiesViewOpen: boolean;
}

class App extends React.Component<object, State> {
  datastore = new Datastore();

  simulationConfigListener = new SimpleListenable();

  state: State = {
    document: null,
    leftNavOpen: false,
    propertiesViewOpen: false,
    canSaveDocument: false,
    isLoading: true
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
    mergeGoogleSheet: () => this.promptForMergeGoogleSheet()
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
        leftNavOpen: true,
        isLoading: false
      });
    }
  }

  componentWillUnmount() {
    this.datastore.removeListener("status_changed", this.onDatastoreStatusChanged);
  }

  render() {
    var viewportView: any;
    var propertiesView: any = undefined;
    var title: string = "GraphIt";
    var isDocumentLoaded: boolean = false;

    if (this.state.isLoading) {
      viewportView = <div className="App-loading"><div className="App-loading-text">Loading...</div></div>;
    } else if (this.state.document !== null) {
      isDocumentLoaded = true;
      title = this.state.document.name;
      viewportView = (
        <SimulationViewport
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
          isDocumentLoaded={isDocumentLoaded}
        />
        <FilesDrawerView.Component
          actionManager={this.actionManager}
          datastore={this.datastore}
          canSave={this.state.canSaveDocument}
          isDocumentLoaded={isDocumentLoaded}
          isOpen={this.state.leftNavOpen}
          onClosed={this.closeLeftNav}
        />
        <div className="App-content">
          {viewportView}
          {propertiesView}
        </div>
      </div>
    );
  }

  private loadDocumentById = (id: string) => {
    // if the datastore isn't ready yet, don't try to load it yet
    if (this.datastore.status() !== DatastoreStatus.SignedIn) {
      this.pendingDocumentLoadId = id;
      return;
    }

    this.startLoading();

    this.datastore.loadFile(id).then((result) => {
      var document = GraphDocument.load(result.content);
      document.name = result.name;
      this.loadDocument(document, id, result.canSave);
    });
  }

  private updateUrlWithDocumentId(documentId?: string) {
    // TODO implement popstate too
    history.pushState({}, window.document.title, documentId ? ("?doc=" + documentId) : "?");
  }

  private startLoading = () => {
    this.setState({
      loadedDocumentId: undefined,
      document: null,
      canSaveDocument: false,
      isLoading: true
    });
  }

  private loadDocument = (
    document: GraphDocument,
    documentId: string | undefined,
    canSave: boolean
  ) => {
    this.setState({
      loadedDocumentId: documentId,
      document: document,
      canSaveDocument: canSave,
      isLoading: false
    });

    this.updateUrlWithDocumentId(documentId);
  }

  private onDatastoreStatusChanged = () => {
    switch (this.datastore.status()) {
      case DatastoreStatus.SignedIn:
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
        break;

      default:
        break;
    }
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
      this.loadDocument(document, /*documentId=*/undefined, false);
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
        document = GraphDocument.loadSGD(serializedDocument);
        document.name = fileResult.name;
        documentId = undefined;
      } else {
        document = this.state.document.merge(serializedDocument);
        documentId = this.state.loadedDocumentId;
      }
      this.loadDocument(document, documentId, this.state.canSaveDocument);
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
      this.datastore.updateFile(this.state.loadedDocumentId, data).then(
        () => {
          alert("saved successfully!");
        },
        (reason) => {
          alert("save failed!\n" + reason);
        }
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
    this.datastore.saveFileAs(name, data, GooglePickerHelper.GRAPHIT_MIME_TYPE).then((id) => {
      this.setState({
        loadedDocumentId: id,
        canSaveDocument: true
      });
      this.updateUrlWithDocumentId(id);
      this.closeLeftNav();
      alert("saved successfully");
    });
  }
}

export default App;
