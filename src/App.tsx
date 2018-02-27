import * as React from 'react';
import Viewport from './Viewport';
import './App.css';
import PropertiesView from './PropertiesView';
import MyNodeDatum from './MyNodeDatum';
import * as D3Force from 'd3-force';
import GraphDocument from './GraphDocument';

interface State {
  document?: GraphDocument;
}

class App extends React.Component<object, State> {
  state: State = {};

  createDummyDocument() {
    var nodes: MyNodeDatum[] = [
      {
        label: "a",
        isLocked: true,
        x: 100,
        y: 100
      },
      {
        label: "b",
        isLocked: false,
        x: 200,
        y: 100
      },
      {
        label: "c",
        isLocked: false,
        x: 150,
        y: 200
      }
    ];

    var links: D3Force.SimulationLinkDatum<MyNodeDatum>[] = [
      {
        source: 0,
        target: 1
      },
      {
        source: 1,
        target: 2
      },
      {
        source: 2,
        target: 0
      }
    ];

    return new GraphDocument(nodes, links);
  }

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
    setTimeout(
      () => {
        this.loadDataFromUrl("data.json");
        // this.setState({
        //   document: this.createDummyDocument()
        // });
      },
      2000
    );
  }

  render() {
    var document = this.state.document;

    var appContents: JSX.Element | JSX.Element[] = [];

    if (document) {
      appContents = [
        <Viewport key="viewport" document={document} />,
        <PropertiesView key="properties"/>
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
