import * as React from "react";

import {
  Drawer,
  List,
  ListItem,
  ListItemText
} from "@material-ui/core";
import { createStyles, withStyles, WithStyles } from "@material-ui/core/styles";

const styles = createStyles({
  list: {
    width: 250
  }
});

export interface Props extends WithStyles<typeof styles> {
  open: boolean;
  onClose: () => void;
}

class MyLeftDrawer extends React.Component<Props, {}> {
  public render() {
    return (
      <Drawer open={this.props.open} onClose={this.props.onClose}>
        <div className={this.props.classes.list}>
          <List>
            {["Open...", "Save as..."].map((text, index) => (
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

export default withStyles(styles)(MyLeftDrawer);
