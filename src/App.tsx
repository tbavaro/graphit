import * as React from 'react';
import SimulationViewport from './SimulationViewport';
import './App.css';
import PropertiesView from './PropertiesView';
import GraphDocument from './GraphDocument';
import ActionManager from './ActionManager';
import { Datastore, DatastoreStatus } from "./Datastore";

interface State {
  document?: GraphDocument;
  datastoreStatus: DatastoreStatus;
}

class App extends React.Component<object, State> {
  datastore = new Datastore();

  state: State = {
    datastoreStatus: this.datastore.status()
  };

  actionManager: ActionManager = {
    onClickSaveDocument: () => {
      if (this.state.document) {
        alert(this.state.document.save());
      }
    }
  };

  loadDataFromUrl(url: string) {
    this.setState({
      document: undefined
    });
    var req = new XMLHttpRequest();
    req.open("get", url);
    req.onload = (evt => {
      this.setState({
        document: GraphDocument.load(req.responseText)
      });
    });
    req.onerror = (evt => {
      alert("error: " + req.status);
    });
    req.send();
  }

  componentDidMount() {
    this.loadDataFromUrl("data.json");
  }

  componentWillMount() {
    this.datastore.onStatusChanged = this.onDatastoreStatusChanged;
    this.onDatastoreStatusChanged(this.datastore.status());
  }

  render() {
    var viewportView: any;

    if (this.state.document) {
      viewportView =
        <SimulationViewport document={this.state.document} />;
    } else {
      // TODO this is a hack to show the empty viewport
      viewportView = <div className="Viewport">Loading...</div>;
    }

    return (
      <div className="App">
        <div className="App-topbar">Datastore status: {this.state.datastoreStatus}</div>
        <div className="App-body">
          {viewportView}
          <PropertiesView actionManager={this.actionManager}/>
        </div>
      </div>
    );
  }

  private onDatastoreStatusChanged = (newStatus: DatastoreStatus) => {
    this.setState({
      datastoreStatus: newStatus
    });
  }
}

export default App;
