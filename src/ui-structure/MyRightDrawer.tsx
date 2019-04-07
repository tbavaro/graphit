import {
  Drawer,
  List,
  ListItem,
  ListItemText
} from "@material-ui/core";
import { createStyles, Theme, withStyles, WithStyles } from "@material-ui/core/styles";
import * as React from "react";

const stylesFunc = (theme: Theme) => ({
  list: {
    width: 250
  },
  toolbar: {
    // backgroundColor: "red",
    height: 48  // TODO: can I get the "dense" toolbar height from `theme`?
  }
});

const styles = createStyles(stylesFunc);

export interface Props extends WithStyles<ReturnType<typeof stylesFunc>> {
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
        <div className={this.props.classes.list}>
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
