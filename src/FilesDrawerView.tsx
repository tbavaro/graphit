import * as React from 'react';
import './FilesDrawerView.css';
import { Datastore, DatastoreStatus, DatastoreFileResult } from "./data/Datastore";
import * as TemporaryNavDrawer from './ui-helpers/TemporaryNavDrawer';
import * as MaterialList from "./ui-helpers/MaterialList";

export interface Actions {
  openFilePicker: () => void;
  saveAs: () => void;
  importUploadedFile: () => void;
  importGoogleSheet: () => void;
}

interface Props extends TemporaryNavDrawer.Props {
  actionManager: Actions;
  datastore: Datastore;
  datastoreStatus: DatastoreStatus;
  isExpandedByDefault?: boolean;
}

interface State {
  isLoadingFiles: boolean;
  files?: DatastoreFileResult[];
}

export class Component extends React.Component<Props, State> {
  state: State = {
    isLoadingFiles: false
  };

  componentWillReceiveProps(newProps: Props) {
    var isNewDatastore = (newProps.datastore !== this.props.datastore);
    var isSignedIn = (newProps.datastoreStatus === DatastoreStatus.SignedIn);
    var wasSignedIn = (this.props.datastoreStatus === DatastoreStatus.SignedIn);

    if (isNewDatastore) {
      this.setState({
        isLoadingFiles: false,
        files: undefined
      });
    }

    if (isNewDatastore || (isSignedIn && !wasSignedIn)) {
      // TODO see if we need to worry about these overlapping
      this.setState({
        isLoadingFiles: true
      });
      newProps.datastore.listFiles().then((files) => {
        this.setState({
          isLoadingFiles: false,
          files: files
        });
      });
    }
  }

  render() {
    var headerContents: any;
    var contents: any;

    switch (this.props.datastoreStatus) {
      case DatastoreStatus.SignedIn:
        var headerClassName = [
          "mdc-list",
          "mdc-list--dense",
          "mdc-list--avatar-list",
          "mdc-list--non-interactive",
          "FilesDrawerView-avatarList"
        ].join(" ");
        headerContents = (
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

  private renderInitializingContents() {
    return "Connecting to Google...";
  }

  private renderSignedInContents() {
    var files = this.state.files || [];

    if (this.state.isLoadingFiles) {
      return <div>(Loading...)</div>;
    } else {
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
                label: "Save as...",
                onClick: this.props.actionManager.saveAs
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
              }
            ]}
          />
          <MaterialList.Component
            items={files.map((file) => {
              return {
                key: "file:" + file.id,
                label: file.name,
                href: "?doc=" + file.id
              };
            })}
          />
        </React.Fragment>
      );
    }
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
}
