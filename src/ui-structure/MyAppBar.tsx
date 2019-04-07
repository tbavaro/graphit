import {
  AppBar,
  IconButton,
  Toolbar,
  Typography
} from "@material-ui/core";
import { createStyles, Theme, withStyles, WithStyles } from "@material-ui/core/styles";
import EditIcon from "@material-ui/icons/Edit";
import MenuIcon from "@material-ui/icons/Menu";
import * as React from "react";

const stylesFunc = (theme: Theme) => ({
  appBar: {
    zIndex: theme.zIndex.drawer + 1
  },
  editButton: {
    marginRight: -16
  },
  grow: {
    flexGrow: 1
  },
  menuButton: {
    marginLeft: -18,
    marginRight: 10
  }
});

const styles = createStyles(stylesFunc);

export interface Props extends WithStyles<ReturnType<typeof stylesFunc>> {
  title: string;
  onClickEditButton: () => void;
  onClickMenuButton: () => void;
}

function MyAppBar(props: Props) {
  const { classes } = props;
  return (
    <AppBar position="static" className={classes.appBar}>
      <Toolbar variant="dense">
        <IconButton className={classes.menuButton} color="inherit" aria-label="Menu" onClick={props.onClickMenuButton}>
          <MenuIcon/>
        </IconButton>
        <Typography className={classes.grow} variant="h6" color="inherit">
          {props.title}
        </Typography>
        <div>
          <IconButton className={classes.editButton} color="inherit" aria-label="Edit" onClick={props.onClickEditButton}>
            <EditIcon/>
          </IconButton>
        </div>
      </Toolbar>
    </AppBar>
  );
}

export default withStyles(styles)(MyAppBar);
