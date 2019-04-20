import * as React from "react";

import IconButton from "@material-ui/core/IconButton";
import Snackbar from "@material-ui/core/Snackbar";
import { createStyles, Theme, withStyles, WithStyles } from "@material-ui/core/styles";

import CloseIcon from "@material-ui/icons/Close";

const stylesFunc = (theme: Theme) => ({
  close: {
    padding: theme.spacing.unit / 2,
  }
});

const styles = createStyles(stylesFunc);

let nextSnackbarMessageId = 0;

interface QueueEntry {
  id: number;
  message: string;
}

interface State {
  currentEntry: QueueEntry | null;
  open: boolean;
}

interface Props extends WithStyles<ReturnType<typeof stylesFunc>> {}

export class MySnackbarHelperInner extends React.Component<Props, State> {
  public state: State = {
    open: false,
    currentEntry: null
  };

  private queue: QueueEntry[] = [];

  public render() {
    const entry = this.state.currentEntry;
    if (entry === null) {
      return null;
    }

    return (
      <Snackbar
        key={entry.id}
        open={this.state.open}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left"
        }}
        message={<span>{entry.message}</span>}
        autoHideDuration={6000}
        onClose={this.handleClose}
        onExited={this.processQueue}
        action={
          <IconButton
            key="close"
            aria-label="Close"
            color="inherit"
            onClick={this.handleClose}
            className={this.props.classes.close}
          >
            <CloseIcon />
          </IconButton>
        }
      />
    );
  }

  public showSnackbarMessage = (message: string) => {
    this.queue.push({
      id: nextSnackbarMessageId++,
      message: message
    });

    if (this.state.open) {
      this.setState({ open: false });
    } else {
      this.processQueue();
    }
  }

  private processQueue = () => {
    const entry = this.queue.shift();
    if (entry !== undefined) {
      this.setState({
        currentEntry: entry,
        open: true
      });
    }
  }

  private handleClose = (event: React.SyntheticEvent<any>, reason?: string) => {
    // don't hide snackbar early just because we lose focus
    if (reason === "clickaway") {
      return;
    }

    this.setState({ open: false });
  }
}

export default withStyles(styles)(MySnackbarHelperInner);
