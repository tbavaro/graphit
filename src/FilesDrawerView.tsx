import * as React from 'react';
import './FilesDrawerView.css';
import { Datastore, DatastoreStatus } from "./data/Datastore";
import * as TemporaryNavDrawer from './ui-helpers/TemporaryNavDrawer';
import * as MaterialList from "./ui-helpers/MaterialList";
import { ListenerPureComponent, ListenerBinding } from './ui-helpers/ListenerPureComponent';

export interface Actions {
  openFilePicker: () => void;
  save: () => void;
  saveAs: () => void;
  importUploadedFile: () => void;
  importGoogleSheet: () => void;
  mergeGoogleSheet: () => void;
}

interface Props extends TemporaryNavDrawer.Props {
  actionManager: Actions;
  canSave: boolean;
  datastore: Datastore;
  isDocumentLoaded: boolean;
}

export class Component extends ListenerPureComponent<Props, {}> {
  protected bindings: ListenerBinding<Props>[] = [
    {
      propertyName: "datastore",
      eventType: "status_changed",
      callback: () => this.datastoreStatusChanged()
    }
  ];

  render() {
    var headerContents: any;
    var contents: any;

    switch (this.props.datastore.status()) {
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
            src={this.props.datastore.currentUserImageUrl() || ""}
            width="56"
            height="56"
          />
          <span className="FilesDrawerView-avatarList-name">
            {this.props.datastore.currentUserName()}
          </span>
          <button
            className="FilesDrawerView-avatarList-expandButton mdc-button mdc-button--dense"
            onClick={this.onClickSignOut}
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
              key: "action:save_as",
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
              key: "action:import_spreadsheet",
              label: "Import spreadsheet...",
              onClick: this.props.actionManager.importGoogleSheet
            },
            {
              key: "action:merge_spreadsheet",
              label: "Merge spreadsheet...",
              onClick: this.props.actionManager.mergeGoogleSheet,
              disabled: !this.props.isDocumentLoaded
            }
          ]}
        />
      </React.Fragment>
    );
  }

  private renderSignedOutContents() {
    return [
      this.renderButton("Sign in", this.onClickSignIn, "button:sign-in")
    ];
  }

  private renderButton(label: string, action: () => void, key?: string) {
    return (
      <div className="FilesDrawerView-button button" key={key} onClick={action}>{label}</div>
    );
  }

  private onClickSignIn = () => {
    this.props.datastore.signIn();
  }

  private onClickSignOut = () => {
    this.props.datastore.signOut();
  }

  private datastoreStatusChanged = () => {
    this.forceUpdate();
  }
}
