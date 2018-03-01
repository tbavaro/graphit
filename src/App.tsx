import * as React from 'react';
import SimulationViewport from './SimulationViewport';
import './App.css';
import PropertiesView from './PropertiesView';
import GraphDocument from './GraphDocument';
import ActionManager from './ActionManager';

interface State {
  document?: GraphDocument;
}

class App extends React.Component<object, State> {
  state: State = {};

  actionManager: ActionManager = {
    onClickSaveDocument: () => {
      alert("save document!");
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

  render() {
    var document = this.state.document;

    var appContents: JSX.Element | JSX.Element[] = [];

    if (document) {
      appContents = [
        <SimulationViewport key="viewport" document={document} />,
        <PropertiesView key="properties" actionManager={this.actionManager}/>
      ];
    } else {
      appContents = (
        <div className="App-loading">
          <div className="App-loading-text">
            Loading...
          </div>
        </div>
      );
    }
    return (
      <div className="App">
        {appContents}
      </div>
    );
  }
}

export default App;
