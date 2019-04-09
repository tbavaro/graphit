import CssBaseline from "@material-ui/core/CssBaseline";
import * as React from "react";

import "./App.css";
import MyAppRoot from "./ui-structure/MyAppRoot";

// interface State {

// }

class App extends React.Component {
  public render() {
    return (
      <React.Fragment>
        <CssBaseline/>
        <MyAppRoot>
          <div id="content" className="App-content"/>
        </MyAppRoot>
      </React.Fragment>
    );
  }
}

export default App;
