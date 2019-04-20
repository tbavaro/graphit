import Drawer from "@material-ui/core/Drawer";
import Popover from "@material-ui/core/Popover";
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
  searchPopoverOpen: boolean;
}

export class MyAppRootInner extends React.Component<Props, State> {
  public state: State = {
    leftDrawerOpen: false,
    rightDrawerOpen: false,
    searchPopoverOpen: false
  };

  public render() {
    return (
      <div className="MyAppRoot">
        <MyAppBar
          title={this.props.title}
          onClickMenuButton={this.openLeftDrawer}
          actionButtons={this.props.appBarActionButtons}
          showSearchField={true}
          onSearchChanged={this.handleSearchChanged}
          searchRef={this.setSearchRef}
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
        {this.renderSearchPopover()}
        <MySnackbarHelper innerRef={this.setSnackbarHelperRef}/>
      </div>
    );
  }

  private renderSearchPopover() {
    const content = (
      <div>This is the popover content.</div>
    );

    return (
      <Popover
        open={this.state.searchPopoverOpen}
        children={content}
        anchorReference="anchorEl"
        anchorEl={this.searchElementRef}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right"
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right"
        }}
        disableAutoFocus={true}
        disableEnforceFocus={true}
        hideBackdrop={true}
      />
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

  private searchElementRef: HTMLElement | null = null;
  private setSearchRef = (newRef: HTMLElement | null) => { this.searchElementRef = newRef; }

  private handleSearchChanged = (newValue: string) => {
    this.setState({ searchPopoverOpen: (newValue !== "") });
  }
}

export default withStyles(styles)(MyAppRootInner);
