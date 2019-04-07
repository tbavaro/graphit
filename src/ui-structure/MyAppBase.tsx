import * as React from "react";

import MyAppBar from "./MyAppBar";
import MyLeftDrawer from "./MyLeftDrawer";

interface State {
  leftDrawerOpen: boolean;
}

class MyAppBase extends React.Component<{}, State> {
  public state: State = {
    leftDrawerOpen: false
  };

  public render() {
    return (
      <div>
        <MyAppBar title="graphit!" onClickMenuButton={this.openLeftDrawer}/>
        <MyLeftDrawer open={this.state.leftDrawerOpen} onClose={this.closeLeftDrawer}/>
      </div>
    );
  }

  private closeLeftDrawer = () => {
    this.setState({ leftDrawerOpen: false });
  }

  private openLeftDrawer = () => {
    this.setState({ leftDrawerOpen: true });
  }
}

export default MyAppBase;
