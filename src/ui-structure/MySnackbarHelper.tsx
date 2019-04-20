import * as React from "react";

import Snackbar from "@material-ui/core/Snackbar";

let nextSnackbarMessageId = 0;

interface QueueEntry {
  id: number;
  message: string;
}

interface State {
  currentEntry: QueueEntry | null;
  open: boolean;
}

export class MySnackbarHelper extends React.Component<{}, State> {
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

  private handleClose = (event: React.SyntheticEvent<any>, reason: string) => {
    // don't hide snackbar early just because we lose focus
    if (reason === "clickaway") {
      return;
    }

    this.setState({ open: false });
  }
}

export default MySnackbarHelper;
