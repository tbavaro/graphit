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
import GooglePickerHelper, { GRAPHIT_MIME_TYPE } from './google/GooglePickerHelper';
import * as LocalFiles from './localfiles/LocalFiles';
import * as SpreadsheetImporter from "./data/SpreadsheetImporter";

type AllActions =
  AppBar.Actions &
  FilesDrawerView.Actions &
  PropertiesView.Actions;

interface State {
  document?: GraphDocument;
  loadedDocumentId?: string;
  datastoreStatus: DatastoreStatus;
  leftNavOpen: boolean;
  propertiesViewOpen: boolean;
}

class App extends React.Component<object, State> {
  datastore = new Datastore();

  simulationConfigListener = new SimpleListenable();

  state: State = {
    datastoreStatus: this.datastore.status(),
    leftNavOpen: false,
    propertiesViewOpen: false
  };

  pendingDocumentLoadId?: string;

  actionManager: AllActions = {
    onClickSaveDocument: () => {
      if (this.state.document) {
        if (!this.state.loadedDocumentId) {
          alert("can't save document without id (yet)");
          return;
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
    },

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
    saveAs: () => this.showSaveAsDialog(),
    importUploadedFile: () => this.importUploadedFile(),
    importGoogleSheet: () => this.importOrMergeGoogleSheet(/*shouldMerge=*/false),
    mergeGoogleSheet: () => this.importOrMergeGoogleSheet(/*shouldMerge=*/true)
  };

  componentWillMount() {
    this.datastore.onStatusChanged = this.onDatastoreStatusChanged;
    this.onDatastoreStatusChanged(this.datastore.status());

    var queryParams = QueryString.parse(location.search);
    var documentId: string | null = queryParams.doc || null;
    if (documentId) {
      this.loadDocumentById(documentId);
    } else {
      this.setState({
        leftNavOpen: true
      });
      this.loadNewDocument();
    }
  }

  render() {
    var viewportView: any;
    var propertiesView: any = undefined;
    var title: string;

    if (this.state.document) {
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
      title = "GraphIt";
      viewportView = <div className="App-loading"><div className="App-loading-text">Loading...</div></div>;
    }

    return (
      <div className="App">
        <AppBar.Component
          title={title}
          onClickNavButton={this.openLeftNav}
          actionManager={this.actionManager}
        />
        <FilesDrawerView.Component
          actionManager={this.actionManager}
          datastore={this.datastore}
          datastoreStatus={this.state.datastoreStatus}
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

  private loadNewDocument = () => {
    this.loadDocument(GraphDocument.empty());
  }

  private loadDocumentById = (id: string) => {
    // if the datastore isn't ready yet, don't try to load it yet
    if (this.state.datastoreStatus !== DatastoreStatus.SignedIn) {
      this.pendingDocumentLoadId = id;
      return;
    }

    this.loadDocument(undefined, undefined);

    Promise.all([
      this.datastore.getFileName(id),
      this.datastore.loadFile(id)
    ]).then(([name, data]) => {
      var document = GraphDocument.load(data);
      document.name = name;
      this.loadDocument(document, id);
    });
  }

  private updateUrlWithDocumentId(documentId?: string) {
    // TODO implement popstate too
    history.pushState({}, window.document.title, documentId ? ("?doc=" + documentId) : "?");
  }

  private loadDocument = (document?: GraphDocument, documentId?: string) => {
    this.pendingDocumentLoadId = undefined;
    this.setState({
      loadedDocumentId: documentId,
      document: document
    });

    this.updateUrlWithDocumentId(documentId);
  }

  private onDatastoreStatusChanged = (newStatus: DatastoreStatus) => {
    if (this.state.datastoreStatus !== newStatus) {
      this.setState({
        datastoreStatus: newStatus
      });

      if (newStatus === DatastoreStatus.SignedIn && this.pendingDocumentLoadId) {
        this.loadDocumentById(this.pendingDocumentLoadId);
      }

      if (newStatus === DatastoreStatus.SignedIn) {
        // SpreadsheetImporter.loadDocumentFromSheet("1F9_NGA1pNY_Hf09y5mINKdnzlZkVRo89v6wEjmKz-R8");
      }
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
    new GooglePickerHelper().createJsonFilePicker((fileResult) => {
      this.loadDocumentById(fileResult.id);
      this.closeLeftNav();
    });
  }

  private importUploadedFile() {
    LocalFiles.openLocalFile((result: LocalFiles.FileResult) => {
      var document = GraphDocument.load(result.data, result.name);
      this.loadDocument(document, /*documentId=*/undefined);
      this.closeLeftNav();
    });
  }

  private importOrMergeGoogleSheet(shouldMerge: boolean) {
    new GooglePickerHelper().createGoogleSheetPicker((fileResult) => {
      // alert("picked: " + fileResult.id);
      SpreadsheetImporter.loadDocumentFromSheet(fileResult.id).then((serializedDocument) => {
        var document: GraphDocument;
        var documentId: string | undefined;
        if (!shouldMerge || !this.state.document) {
          document = GraphDocument.loadSGD(serializedDocument);
          documentId = undefined;
        } else {
          document = this.state.document.merge(serializedDocument);
          documentId = this.state.loadedDocumentId;
        }
        this.loadDocument(document, documentId);
        this.closeLeftNav();
      });
    });
  }

  private showSaveAsDialog() {
    // alert("save as");
    var name = prompt("Save as", this.state.document ? this.state.document.name : "Untitled");
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

  private saveAs(name: string) {
    if (!this.state.document) {
      return;
    }

    this.state.document.name = name;
    this.forceUpdate(); // because we changed the name

    var data = this.state.document.save();
    this.datastore.saveFileAs(name, data, GRAPHIT_MIME_TYPE).then((id) => {
      this.setState({
        loadedDocumentId: id
      });
      this.updateUrlWithDocumentId(id);
      this.closeLeftNav();
      alert("saved successfully");
    });
  }
}

export default App;
