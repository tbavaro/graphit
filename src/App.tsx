import CssBaseline from "@material-ui/core/CssBaseline";
import * as React from "react";

import "./App.css";

import { Datastore, DatastoreStatus } from "./data/Datastore";

import MyAppRoot from "./ui-structure/MyAppRoot";
import * as NavDrawerContents from "./ui-structure/NavDrawerContents";

interface State {
  datastoreStatus: DatastoreStatus
}

type Actions = NavDrawerContents.Actions;

class App extends React.Component<{}, State> {
  public state: State = {
    datastoreStatus: DatastoreStatus.Initializing
  };

  private datastore = new Datastore();

  private actions: Actions = {
    signIn: () => this.datastore.signIn(),
    signOut: () => this.datastore.signOut()
  };

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
      <NavDrawerContents.Component
        actions={this.actions}
        datastoreStatus={this.datastore.status()}
      />
    );

    return (
      <React.Fragment>
        <CssBaseline/>
        <MyAppRoot
          leftDrawerChildren={navDrawerContents}
        >
          <div id="content" className="App-content"/>
        </MyAppRoot>
      </React.Fragment>
    );
  }

  private onDatastoreStatusChanged = () => {
    this.setState({ datastoreStatus: this.datastore.status() });
  }
}

export default App;
