import Drawer from "@material-ui/core/Drawer";
import {
  createStyles,
  withStyles,
  WithStyles
} from "@material-ui/core/styles";
import * as React from "react";

import MyAppBar, { ActionButtonDef } from "./MyAppBar";
import MySnackbarHelper, { MySnackbarHelperInner } from "./MySnackbarHelper";

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
  appBarActionButtons?: ActionButtonDef[];
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
          onClickMenuButton={this.openLeftDrawer}
          actionButtons={this.props.appBarActionButtons}
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
        <MySnackbarHelper innerRef={this.setSnackbarHelperRef}/>
      </div>
    );
  }

  public closeLeftDrawer = () => {
    this.setState({ leftDrawerOpen: false });
  }

  private openLeftDrawer = () => {
    this.setState({ leftDrawerOpen: true });
  }

  public toggleRightDrawer = () => {
    this.setState({ rightDrawerOpen: !this.state.rightDrawerOpen });
  }

  private snackbarHelperRef?: MySnackbarHelperInner;
  private setSnackbarHelperRef = (newRef: MySnackbarHelperInner) => {
    this.snackbarHelperRef = newRef;
  }
  public showSnackbarMessage(message: string) {
    if (this.snackbarHelperRef) {
      this.snackbarHelperRef.showSnackbarMessage(message);
    }
  }
}

export default withStyles(styles)(MyAppRootInner);
