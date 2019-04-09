import {
  Drawer,
} from "@material-ui/core";
import * as React from "react";

export interface Props {
  onClose: () => void;
  open: boolean;
}

class MyLeftDrawer extends React.Component<Props, {}> {
  public render() {
    return (
      <Drawer
        open={this.props.open}
        onClose={this.props.onClose}
        children={this.props.children}
      />
    );
  }
}

export default MyLeftDrawer;
