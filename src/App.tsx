import CssBaseline from "@material-ui/core/CssBaseline";
import * as React from "react";

import "./App.css";

import { Datastore, DatastoreStatus } from "./data/Datastore";

import ActionManager from "./ActionManager";
import MyAppRoot, { MyAppRootInner } from "./ui-structure/MyAppRoot";
import NavDrawerContents from "./ui-structure/NavDrawerContents";
import PropertiesDrawerContents from "./ui-structure/PropertiesDrawerContents";

interface State {
  datastoreStatus: DatastoreStatus
}

class App extends React.Component<{}, State> {
  public state: State = {
    datastoreStatus: DatastoreStatus.Initializing
  };

  private datastore = new Datastore();
  private actionManager = new ActionManager(this.datastore, {
    loadDocumentById: (id: string) => {
      alert(`load: ${id}`);
      this.closeLeftDrawer();
    }
  });

  public componentWillMount() {
    if (super.componentWillMount) {
      super.componentWillMount();
    }
    this.datastore.addListener("status_changed", this.onDatastoreStatusChanged);
    this.onDatastoreStatusChanged();
  }

  public componentWillUnmount() {
    if (super.componentWillUnmount) {
      super.componentWillUnmount();
    }
    this.datastore.removeListener("status_changed", this.onDatastoreStatusChanged);
  }

  public render() {
    const navDrawerContents = (
      <NavDrawerContents
        actions={this.actionManager}
        datastoreStatus={this.datastore.status()}
      />
    );

    const propertiesDrawerContents = (
      <PropertiesDrawerContents/>
    );

    return (
      <React.Fragment>
        <CssBaseline/>
        <MyAppRoot
          leftDrawerChildren={navDrawerContents}
          rightDrawerChildren={propertiesDrawerContents}
          innerRef={this.setAppRootRef}
        >
          <div id="content" className="App-content"/>
        </MyAppRoot>
      </React.Fragment>
    );
  }

  private onDatastoreStatusChanged = () => {
    this.setState({ datastoreStatus: this.datastore.status() });
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
}

export default App;
