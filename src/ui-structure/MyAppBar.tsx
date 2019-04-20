import AppBar from "@material-ui/core/AppBar";
import IconButton from "@material-ui/core/IconButton";
import { createStyles, Theme, withStyles, WithStyles } from "@material-ui/core/styles";
import SvgIcon from "@material-ui/core/SvgIcon";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import MenuIcon from "@material-ui/icons/Menu";
import * as React from "react";

const stylesFunc = (theme: Theme) => ({
  appBar: {
    zIndex: theme.zIndex.drawer + 1
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
}

export default withStyles(styles)(MyAppBar);
