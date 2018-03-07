import * as React from 'react';
import SimulationViewport from './SimulationViewport';
import './App.css';
import AppBar from './AppBar';
import FilesDrawerView from './FilesDrawerView';
import PropertiesView from './PropertiesView';
import GraphDocument from './GraphDocument';
import ActionManager from './ActionManager';
import { Datastore, DatastoreStatus } from "./Datastore";
import * as QueryString from "query-string";
import TemporaryNavDrawer from './TemporaryNavDrawer';

interface State {
  document?: GraphDocument;
  loadedDocumentId?: string;
  datastoreStatus: DatastoreStatus;
  leftNavOpen: boolean;
}

class App extends React.Component<object, State> {
  datastore = new Datastore();

  state: State = {
    datastoreStatus: this.datastore.status(),
    leftNavOpen: false
  };

  pendingDocumentLoadId?: string;
  expandLeftDrawerOnLoad: boolean = false;

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
      this.expandLeftDrawerOnLoad = true;
      this.loadNewDocument();
    }
  }

  render() {
    var viewportView: any;

    if (this.state.document) {
      viewportView =
        <SimulationViewport document={this.state.document} />;
    } else {
      viewportView = <div className="App-loading"><div className="App-loading-text">Loading...</div></div>;
    }

    return (
      <div className="App">
        <AppBar title="Untitled" onClickNavButton={this.openLeftNav}/>
        <TemporaryNavDrawer isOpen={this.state.leftNavOpen}/>
        {viewportView}
        <div style={{display: "none"}}>
          <FilesDrawerView
              datastore={this.datastore}
              datastoreStatus={this.state.datastoreStatus}
              isExpandedByDefault={this.expandLeftDrawerOnLoad}
          />
          <PropertiesView actionManager={this.actionManager}/>
        </div>
      </div>
    );
  }

  private loadNewDocument = () => {
    this.loadDocument(new GraphDocument());
  }

  private loadDocumentById = (id: string) => {
    // if the datastore isn't ready yet, don't try to load it yet
    if (this.state.datastoreStatus !== DatastoreStatus.SignedIn) {
      this.pendingDocumentLoadId = id;
      return;
    }

    this.loadDocument(undefined, undefined);

    this.datastore.loadFile(id).then((data) => {
      this.loadDocument(GraphDocument.load(data), id);
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
