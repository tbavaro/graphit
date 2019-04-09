import {
  Drawer,
} from "@material-ui/core";
import {
  createStyles,
  withStyles,
  WithStyles
} from "@material-ui/core/styles";
import * as React from "react";

import MyAppBar from "./MyAppBar";
import MyRightDrawer from "./MyRightDrawer";
import * as UiStructureHelpers from "./UiStructureHelpers";

import "./MyAppRoot.css";

const styles = createStyles({
  contentContainerOuterPadding: {
    paddingTop: UiStructureHelpers.DENSE_APP_BAR_HEIGHT
  }
});

export interface Props extends WithStyles<typeof styles> {
  leftDrawerChildren: any;
}

interface State {
  leftDrawerOpen: boolean;
  rightDrawerOpen: boolean;
}

class MyAppRoot extends React.Component<Props, State> {
  public state: State = {
    leftDrawerOpen: false,
    rightDrawerOpen: false
  };

  public render() {
    return (
      <div className="MyAppRoot">
        <MyAppBar
          title="GraphIt"
          onClickEditButton={this.toggleRightDrawer}
          onClickMenuButton={this.openLeftDrawer}
        />
        <Drawer
          open={this.state.leftDrawerOpen}
          onClose={this.closeLeftDrawer}
          children={this.props.leftDrawerChildren}
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
}

export default withStyles(styles)(MyAppRoot);
