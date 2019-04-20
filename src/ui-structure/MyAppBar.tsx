import AppBar from "@material-ui/core/AppBar";
import IconButton from "@material-ui/core/IconButton";
import InputBase from "@material-ui/core/InputBase";
import { createStyles, StyleRules, Theme, withStyles, WithStyles } from "@material-ui/core/styles";
import { fade } from "@material-ui/core/styles/colorManipulator";
import SvgIcon from "@material-ui/core/SvgIcon";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";

import MenuIcon from "@material-ui/icons/Menu";
import SearchIcon from "@material-ui/icons/Search";

import * as React from "react";

import "./MyAppBar.css";

const stylesFunc = (theme: Theme): StyleRules<string> => ({
  appBar: {
    zIndex: theme.zIndex.drawer + 1
  },
  grow: {
    flexGrow: 1,
  },
  lastActionButton: {
    marginRight: -16
  },
  title: {
    flexGrow: 1
  },
  menuButton: {
    marginLeft: -18,
    marginRight: 10
  },
  search: {
    position: "relative",
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    "&:hover": {
      backgroundColor: fade(theme.palette.common.white, 0.25),
    },
    marginLeft: 0,
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      marginLeft: theme.spacing.unit,
      width: "auto",
    },
  },
  searchIcon: {
    width: theme.spacing.unit * 9,
    height: "100%",
    position: "absolute",
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  inputRoot: {
    color: "inherit",
    width: "100%",
  },
  inputInput: {
    paddingTop: theme.spacing.unit,
    paddingRight: theme.spacing.unit,
    paddingBottom: theme.spacing.unit,
    paddingLeft: theme.spacing.unit * 10,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      width: 120,
      "&:focus": {
        width: 200,
      },
    },
  }
});

const styles = createStyles(stylesFunc);

export interface ActionButtonDef {
  key?: string;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  icon: typeof SvgIcon;
}

export interface Props extends WithStyles<ReturnType<typeof stylesFunc>> {
  title: string;
  onClickMenuButton: () => void;

  actionButtons?: ActionButtonDef[];

  showSearchField?: boolean;
  onSearchChanged?: (newValue: string) => void;
  searchRef?: (newRef: HTMLElement | null) => void;
}

class MyAppBar extends React.PureComponent<Props, {}> {
  public render() {
    const { actionButtons, classes } = this.props;
    return (
      <AppBar position="static" className={classes.appBar}>
        <Toolbar variant="dense">
          <IconButton className={classes.menuButton} color="inherit" aria-label="Menu" onClick={this.props.onClickMenuButton}>
            <MenuIcon/>
          </IconButton>
          <Typography className={classes.title} variant="h6" color="inherit" noWrap={true}>
            {this.props.title}
          </Typography>
          {
            this.props.showSearchField ? this.renderSearchField() : null
          }
          <div>
            {
              actionButtons
                ? actionButtons.map((def, i) => {
                    return this.renderActionButton(def, i === (actionButtons.length - 1));
                  })
                : null
            }
          </div>
        </Toolbar>
      </AppBar>
    );
  }

  private renderActionButton(def: ActionButtonDef, isLast: boolean) {
    return (
      <IconButton
        key={def.key || def.label}
        className={isLast ? this.props.classes.lastActionButton : undefined}
        color="inherit"
        aria-label={def.label}
        disabled={def.disabled}
        onClick={def.onClick}
        children={React.createElement(def.icon, {})}
      />
    );
  }

  private renderSearchField() {
    const { classes } = this.props;
    return (
      <React.Fragment>
        <div className={classes.grow} />
        <div className={classes.search + " MyAppBar-search"} ref={this.props.searchRef}>
          <div className={classes.searchIcon}>
            <SearchIcon />
          </div>
          <InputBase
            placeholder="Search…"
            classes={{
              root: classes.inputRoot,
              input: classes.inputInput,
            }}
            onChange={this.handleSearchChange}
          />
        </div>
      </React.Fragment>
    );
  }

  private handleSearchChange = (event: React.ChangeEvent<{ value: string }>) => {
    if (this.props.onSearchChanged) {
      this.props.onSearchChanged(event.target.value);
    }
  }
}

export default withStyles(styles)(MyAppBar);
