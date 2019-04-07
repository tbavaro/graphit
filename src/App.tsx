import CssBaseline from "@material-ui/core/CssBaseline";
import * as React from "react";

import MyAppRoot from "./ui-structure/MyAppRoot";

class App extends React.Component {
  public render() {
    return (
      <React.Fragment>
        <CssBaseline/>
        <MyAppRoot/>
      </React.Fragment>
    );
  }
}

export default App;
