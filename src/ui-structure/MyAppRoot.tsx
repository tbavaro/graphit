import { createStyles, withStyles, WithStyles } from "@material-ui/core/styles";
import * as React from "react";

import MyAppBar from "./MyAppBar";
import MyLeftDrawer from "./MyLeftDrawer";
import MyRightDrawer from "./MyRightDrawer";
import * as UiStructureHelpers from "./UiStructureHelpers";

import "./MyAppRoot.css";

const styles = createStyles({
  contentContainerOuterPadding: {
    paddingTop: UiStructureHelpers.DENSE_APP_BAR_HEIGHT
  }
});

export interface Props extends WithStyles<typeof styles> {}

interface State {
  isSignedIn: boolean;
  leftDrawerOpen: boolean;
  rightDrawerOpen: boolean;
}

class MyAppRoot extends React.Component<Props, State> {
  public state: State = {
    isSignedIn: false,
    leftDrawerOpen: false,
    rightDrawerOpen: false
  };

  public render() {
    return (
      <div className="MyAppRoot">
        <MyAppBar
          title="graphit"
          onClickEditButton={this.toggleRightDrawer}
          onClickMenuButton={this.openLeftDrawer}
        />
        <MyLeftDrawer
          isSignedIn={this.state.isSignedIn}
          open={this.state.leftDrawerOpen}
          onClose={this.closeLeftDrawer}
          onSignIn={this.signIn}
        />
        <MyRightDrawer
          open={this.state.rightDrawerOpen}
        />
        <div className={"MyAppRoot-contentContainerOuter " + this.props.classes.contentContainerOuterPadding}>
          <div className="MyAppRoot-contentContainerInner" children={this.props.children}/>
        </div>
      </div>
    );
  }

  private closeLeftDrawer = () => {
    this.setState({ leftDrawerOpen: false });
  }

  private openLeftDrawer = () => {
    this.setState({ leftDrawerOpen: true });
  }

  private toggleRightDrawer = () => {
    this.setState({ rightDrawerOpen: !this.state.rightDrawerOpen });
  }

  private signIn = () => {
    alert("sign in!");
    this.setState({ isSignedIn: true });
    this.closeLeftDrawer();
  }
}

export default withStyles(styles)(MyAppRoot);
