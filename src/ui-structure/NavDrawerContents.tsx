import Avatar from "@material-ui/core/Avatar";
import Divider from "@material-ui/core/Divider";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import PersonIcon from "@material-ui/icons/Person";
import * as React from "react";

import { DatastoreStatus } from "../data/Datastore";

import "./NavDrawerContents.css";

export interface Props {
  actions: Actions;
  canSave: boolean;
  documentIsLoaded: boolean;
  datastoreStatus: DatastoreStatus;
  currentUserImageUrl?: string;
  currentUserName?: string;
}

export interface Actions {
  signIn: () => void;
  signOut: () => void;

  openFromGoogle: () => void;
  save: () => void;
  saveAs: () => void;
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
      const avatar = (
        this.props.currentUserImageUrl
          ? <Avatar className="NavDrawerContents-currentUserAvatar" src={this.props.currentUserImageUrl}/>
          : <Avatar className="NavDrawerContents-currentUserAvatar"><PersonIcon/></Avatar>
      );

      const text = (this.props.currentUserName || "Signed in");
      headerItem = (
        <ListItem button={false}>
          {avatar}
          <ListItemText
            className="NavDrawerContents-currentUserName"
            primary={text}
            primaryTypographyProps={{ noWrap: true }}
          />
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
                    disabled: !this.props.canSave,
                    action: this.props.actions.save
                  }),
                  renderMenuOption({
                    label: "Save as...",
                    disabled: !this.props.documentIsLoaded,
                    action: this.props.actions.saveAs
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
