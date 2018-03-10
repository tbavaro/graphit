import * as React from 'react';
import SimulationViewport from './SimulationViewport';
import './App.css';
import AppBar from './AppBar';
import FilesDrawerView from './FilesDrawerView';
import GraphDocument from './GraphDocument';
import ActionManager from './ActionManager';
import { Datastore, DatastoreStatus } from "./Datastore";
import * as QueryString from "query-string";
import PropertiesView from './PropertiesView';

interface State {
  document?: GraphDocument;
  loadedDocumentId?: string;
  datastoreStatus: DatastoreStatus;
  leftNavOpen: boolean;
  propertiesViewOpen: boolean;
}

class App extends React.Component<object, State> {
  datastore = new Datastore();

  state: State = {
    datastoreStatus: this.datastore.status(),
    leftNavOpen: false,
    propertiesViewOpen: false
  };

  pendingDocumentLoadId?: string;

  actionManager: ActionManager = {
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
    }
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
    var title: string;

    if (this.state.document) {
      title = this.state.document.name;
      viewportView =
        <SimulationViewport document={this.state.document} />;
    } else {
      title = "GraphIt";
      viewportView = <div className="App-loading"><div className="App-loading-text">Loading...</div></div>;
    }

    return (
      <div className="App">
        <AppBar
          title={title}
          onClickNavButton={this.openLeftNav}
          actionManager={this.actionManager}
        />
        <FilesDrawerView
          datastore={this.datastore}
          datastoreStatus={this.state.datastoreStatus}
          isOpen={this.state.leftNavOpen}
        />
        <div className="App-content">
          {viewportView}
          <PropertiesView actionManager={this.actionManager} isOpen={this.state.propertiesViewOpen}/>
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

  private loadDocument = (document?: GraphDocument, documentId?: string) => {
    this.pendingDocumentLoadId = undefined;
    this.setState({
      loadedDocumentId: documentId,
      document: document
    });
  }

  private onDatastoreStatusChanged = (newStatus: DatastoreStatus) => {
    if (this.state.datastoreStatus !== newStatus) {
      this.setState({
        datastoreStatus: newStatus
      });

      if (newStatus === DatastoreStatus.SignedIn && this.pendingDocumentLoadId) {
        this.loadDocumentById(this.pendingDocumentLoadId);
      }
    }
  }

  private openLeftNav = () => {
    this.setState({
      leftNavOpen: true
    });
  }
}

export default App;
