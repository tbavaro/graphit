import {
  Drawer,
  List,
  ListItem,
  ListItemText
} from "@material-ui/core";
import { createStyles, withStyles, WithStyles } from "@material-ui/core/styles";
import * as React from "react";

import "./MyRightDrawer.css";
import * as UiStructureHelpers from "./UiStructureHelpers";

const styles = createStyles({
  toolbar: {
    height: UiStructureHelpers.DENSE_APP_BAR_HEIGHT
  }
});

export interface Props extends WithStyles<typeof styles> {
  open: boolean;
}

class MyRightDrawer extends React.Component<Props, {}> {
  public render() {
    const menuOptions = [
      "Open...",
      "Save",
      "Save as...",
      "Import file...",
      "Merge spreadsheet...",
      "View as JSON",
      "Sign out"
    ];

    return (
      <Drawer variant="persistent" open={this.props.open} anchor="right">
        <div className={this.props.classes.toolbar}/>
        <div className="MyRightDrawer-list">
          <List>
            {menuOptions.map((text, index) => (
              <ListItem button={true} key={text}>
                <ListItemText primary={text} />
              </ListItem>
            ))}
          </List>
        </div>
      </Drawer>
    );
  }
}

export default withStyles(styles)(MyRightDrawer);
