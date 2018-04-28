import * as React from 'react';
import './FilesDrawerView.css';
import { DatastoreStatus } from "./data/DatastoreStatus";
import * as TemporaryNavDrawer from './ui-helpers/TemporaryNavDrawer';
import * as MaterialList from "./ui-helpers/MaterialList";

export interface Actions {
  openFilePicker: () => void;
  save: () => void;
  saveAs: () => void;
  importUploadedFile: () => void;
  mergeGoogleSheet: () => void;
  viewAsJSON: () => void;
  signIn: () => void;
  signOut: () => void;
}

export interface Props extends TemporaryNavDrawer.Props {
  actionManager: Actions;
  canSave: boolean;
  isDocumentLoaded: boolean;
  datastoreStatus: DatastoreStatus;
  currentUserImageUrl?: string;
  currentUserName?: string;
}

export class Component extends React.PureComponent<Props, {}> {
  render() {
    var headerContents: any;
    var contents: any;

    switch (this.props.datastoreStatus) {
      case DatastoreStatus.SignedIn:
        headerContents = this.renderSignedInHeaderContents();
        contents = this.renderSignedInContents();
        break;

      case DatastoreStatus.SignedOut:
        contents = this.renderSignedOutContents();
        break;

      default:
        contents = this.renderInitializingContents();
    }

    return (
      <TemporaryNavDrawer.TemporaryNavDrawer
        // contentsClassName="FilesDrawerView-contents"
        // isLeftDrawer={true}
        isOpen={this.props.isOpen}
        onClosed={this.props.onClosed}
        children={contents}
        headerChildren={headerContents}
      />
    );
  }

  private renderSignedInHeaderContents() {
    var headerClassName = [
      "mdc-list",
      "mdc-list--dense",
      "mdc-list--avatar-list",
      "mdc-list--non-interactive",
      "FilesDrawerView-avatarList"
    ].join(" ");
    return (
      <ul className={headerClassName}>
        <li className="mdc-list-item">
          <img
            className="mdc-list-item__graphic"
            src={this.props.currentUserImageUrl || ""}
            width="56"
            height="56"
          />
          <span className="FilesDrawerView-avatarList-name">
            {this.props.currentUserName || "(user name not available)"}
          </span>
          <button
            className="FilesDrawerView-avatarList-expandButton mdc-button mdc-button--dense"
            onClick={this.props.actionManager.signOut}
          >
            <i className="material-icons mdc-button__icon">expand_more</i>
          </button>
        </li>
      </ul>
    );
  }

  private renderInitializingContents() {
    return "Connecting to Google...";
  }

  private renderSignedInContents() {
    return (
      <React.Fragment>
        <MaterialList.Component
          items={[
            {
              key: "action:open",
              label: "Open...",
              onClick: this.props.actionManager.openFilePicker
            },
            {
              key: "action:save",
              label: "Save",
              onClick: this.props.actionManager.save,
              disabled: !this.props.canSave
            },
            {
              key: "action:save_as",
              label: "Save as...",
              onClick: this.props.actionManager.saveAs,
              disabled: !this.props.isDocumentLoaded
            },
            {
              key: "action:import_upload",
              label: "Import file...",
              onClick: this.props.actionManager.importUploadedFile
            },
            {
              key: "action:merge_spreadsheet",
              label: "Merge spreadsheet...",
              onClick: this.props.actionManager.mergeGoogleSheet,
              disabled: !this.props.isDocumentLoaded
            },
            {
              key: "action:view_as_json",
              label: "View as JSON",
              onClick: this.props.actionManager.viewAsJSON,
              disabled: !this.props.isDocumentLoaded
            }
          ]}
        />
      </React.Fragment>
    );
  }

  private renderSignedOutContents() {
    return [
      this.renderButton(
        "Sign in",
        this.props.actionManager.signIn,
        "button:sign-in"
      )
    ];
  }

  private renderButton(
    label: string,
    action: () => void,
    key?: string
  ) {
    return (
      <div
        className="FilesDrawerView-button button"
        key={key}
        onClick={action}
        children={label}
      />
    );
  }
}
