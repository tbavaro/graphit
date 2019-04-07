import {
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemText
} from "@material-ui/core";
import { createStyles, withStyles, WithStyles } from "@material-ui/core/styles";
import * as React from "react";

const styles = createStyles({
  list: {
    width: 250
  }
});

export interface Props extends WithStyles<typeof styles> {
  isSignedIn: boolean;
  onClose: () => void;
  onSignIn: () => void;
  open: boolean;
}

class MyLeftDrawer extends React.Component<Props, {}> {
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
      <Drawer open={this.props.open} onClose={this.props.onClose}>
        <div className={this.props.classes.list}>
          <List disablePadding={true}>
            {
              this.props.isSignedIn
                ? (
                    <ListItem button={false}>
                      <ListItemText primary="Signed in"/>
                    </ListItem>
                  )
                : (
                    <ListItem button={true} onClick={this.props.onSignIn}>
                      <ListItemText primary="Sign in..."/>
                    </ListItem>
                  )
            }
          </List>
          <Divider/>
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

export default withStyles(styles)(MyLeftDrawer);
