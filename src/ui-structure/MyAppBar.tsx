import * as React from "react";

import {
  AppBar,
  IconButton,
  Toolbar,
  Typography
} from "@material-ui/core";
import { createStyles, withStyles, WithStyles } from "@material-ui/core/styles";
import MenuIcon from "@material-ui/icons/Menu";

const styles = createStyles({
  menuButton: {
    marginLeft: -18,
    marginRight: 10
  }
});

export interface Props extends WithStyles<typeof styles> {
  title: string;
  onClickMenuButton: () => void;
}

function MyAppBar(props: Props) {
  const { classes } = props;
  return (
    <AppBar position="static">
      <Toolbar variant="dense">
        <IconButton className={classes.menuButton} color="inherit" aria-label="Menu" onClick={props.onClickMenuButton}>
          <MenuIcon/>
        </IconButton>
        <Typography variant="h6" color="inherit">
          {props.title}
        </Typography>
      </Toolbar>
    </AppBar>
  );
}

export default withStyles(styles)(MyAppBar);
