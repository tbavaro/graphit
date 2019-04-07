import { createStyles, withStyles, WithStyles } from "@material-ui/core/styles";
import * as React from "react";

import MyAppBar from "./MyAppBar";
import MyLeftDrawer from "./MyLeftDrawer";
import MyRightDrawer from "./MyRightDrawer";

const styles = createStyles({
  content: {
    border: "5px dashed gray",
    height: "100%",
    position: "absolute",
    width: "100%"
  },
  contentContainerInner: {
    flex: 1,
    position: "relative"
  },
  contentContainerOuter: {
    display: "flex",
    height: "100%",
    paddingTop: 48,
    position: "absolute",
    width: "100%"
  },
  root: {
    display: "flex"
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
    const content = (
      <div id="content" className={this.props.classes.content}/>
    );

    return (
      <div id="MyAppRoot" className={this.props.classes.root}>
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
        <div className={this.props.classes.contentContainerOuter}>
          <div className={this.props.classes.contentContainerInner}>
            {content}
          </div>
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
