import {
  Divider,
  List,
  ListItem,
  ListItemText
} from "@material-ui/core";
import * as React from "react";

import { DatastoreStatus } from "../data/Datastore";

import "./NavDrawerContents.css";

export interface Props {
  actions: Actions;
  datastoreStatus: DatastoreStatus;
}

export interface Actions {
  openFromGoogle: () => void;
  mergeGoogleSheet: () => void;
  signIn: () => void;
  signOut: () => void;
}

function renderMenuOption(attrs: {
  label: string;
  action?: () => void;
  disabled?: boolean;
  hidden?: boolean;
}) {
  return (
    <ListItem
      button={true}
      disabled={!!attrs.disabled}
      key={attrs.label}
      onClick={attrs.action}
    >
      <ListItemText primary={attrs.label} />
    </ListItem>
  )
}

class NavDrawerContents extends React.Component<Props, {}> {
  public render() {
    const isInitializing = (this.props.datastoreStatus === DatastoreStatus.Initializing);
    const isSignedIn = (this.props.datastoreStatus === DatastoreStatus.SignedIn);

    let headerItem: JSX.Element;
    if (isInitializing) {
      headerItem = (
        <ListItem button={false}>
          <ListItemText primary="Initializing"/>
        </ListItem>
      );
    } else if (isSignedIn) {
      headerItem = (
        <ListItem button={false}>
          <ListItemText primary="Signed in"/>
        </ListItem>
      );
    } else {
      headerItem = (
        <ListItem button={true} onClick={this.props.actions.signIn}>
          <ListItemText primary="Sign in..."/>
        </ListItem>
      );
    }

    return (
      <div className="NavDrawerContents-list">
        <List disablePadding={true}>
          {headerItem}
        </List>
        <Divider/>
        <List>
          {
            isSignedIn
              ? [
                  renderMenuOption({
                    label: "Open...",
                    action: this.props.actions.openFromGoogle
                  }),
                  renderMenuOption({
                    label: "Save",
                    disabled: true
                  }),
                  renderMenuOption({
                    label: "Save as...",
                    disabled: true
                  }),
                  renderMenuOption({
                    label: "Merge spreadsheet...",
                    action: this.props.actions.mergeGoogleSheet
                  }),
                  <Divider key="div1"/>,
                  renderMenuOption({
                    label: "Sign out",
                    action: this.props.actions.signOut
                  })
                ]
              : null
          }
        </List>
      </div>
    );
  }
}

export default NavDrawerContents;
