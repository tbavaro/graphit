import Drawer from "@material-ui/core/Drawer";
import {
  createStyles,
  withStyles,
  WithStyles
} from "@material-ui/core/styles";
import * as React from "react";

import MyAppBar from "./MyAppBar";

import "./MyAppRoot.css";

// TODO: can I get the "dense" toolbar height from `theme`?
const DENSE_APP_BAR_HEIGHT = 48;

const styles = createStyles({
  contentContainerOuterPadding: {
    paddingTop: DENSE_APP_BAR_HEIGHT
  },
  toolbar: {
    height: DENSE_APP_BAR_HEIGHT
  }
});

export interface Props extends WithStyles<typeof styles> {
  leftDrawerChildren: any;
  rightDrawerChildren: any;
  title: string;
}

interface State {
  leftDrawerOpen: boolean;
  rightDrawerOpen: boolean;
}

export class MyAppRootInner extends React.Component<Props, State> {
  public state: State = {
    leftDrawerOpen: false,
    rightDrawerOpen: false
  };

  public render() {
    return (
      <div className="MyAppRoot">
        <MyAppBar
          title={this.props.title}
          onClickEditButton={this.toggleRightDrawer}
          onClickMenuButton={this.openLeftDrawer}
        />
        <Drawer
          open={this.state.leftDrawerOpen}
          onClose={this.closeLeftDrawer}
          children={this.props.leftDrawerChildren}
        />
        <Drawer variant="persistent" open={this.state.rightDrawerOpen} anchor="right">
          <div className={this.props.classes.toolbar}/>
          {this.props.rightDrawerChildren}
        </Drawer>
        <div className={"MyAppRoot-contentContainerOuter " + this.props.classes.contentContainerOuterPadding}>
          <div className="MyAppRoot-contentContainerInner" children={this.props.children}/>
        </div>
      </div>
    );
  }

  public closeLeftDrawer = () => {
    this.setState({ leftDrawerOpen: false });
  }

  public closeRightDrawer = () => {
    this.setState({ rightDrawerOpen: false });
  }

  private openLeftDrawer = () => {
    this.setState({ leftDrawerOpen: true });
  }

  private toggleRightDrawer = () => {
    this.setState({ rightDrawerOpen: !this.state.rightDrawerOpen });
  }
}

export default withStyles(styles)(MyAppRootInner);
