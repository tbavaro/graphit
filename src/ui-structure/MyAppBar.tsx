import AppBar from "@material-ui/core/AppBar";
import IconButton from "@material-ui/core/IconButton";
import { createStyles, Theme, withStyles, WithStyles } from "@material-ui/core/styles";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
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
  title: {
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
  documentIsLoaded: boolean;
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
        <Typography className={classes.title} variant="h6" color="inherit" noWrap={true}>
          {props.title}
        </Typography>
        <div>
          <IconButton
            className={classes.editButton}
            color="inherit"
            aria-label="Edit"
            disabled={!props.documentIsLoaded}
            onClick={props.onClickEditButton}
          >
            <EditIcon/>
          </IconButton>
        </div>
      </Toolbar>
    </AppBar>
  );
}

export default withStyles(styles)(MyAppBar);
