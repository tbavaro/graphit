import {
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemText
} from "@material-ui/core";
import * as React from "react";

import "./MyLeftDrawer.css";

export interface Props {
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
        <div className="MyLeftDrawer-list">
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

export default MyLeftDrawer;
