import * as React from 'react';
import './FilesDrawerView.css';
import { Datastore, DatastoreStatus, DatastoreFileResult } from "./Datastore";
import * as TemporaryNavDrawer from './TemporaryNavDrawer';
import * as MaterialList from "./MaterialList";

interface MyActions {
  onClickSaveDocument: () => void;
}

interface Props extends TemporaryNavDrawer.Props {
  actionManager: MyActions;
  datastore: Datastore;
  datastoreStatus: DatastoreStatus;
  isExpandedByDefault?: boolean;
}

interface State {
  isLoadingFiles: boolean;
  files?: DatastoreFileResult[];
}

class FilesDrawerView extends React.Component<Props, State> {
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
    var contents: any;

    switch (this.props.datastoreStatus) {
      case DatastoreStatus.SignedIn:
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
        children={contents}
      />
    );
  }

  private renderInitializingContents() {
    return "Connecting to Google...";
  }

  private renderSignedInContents() {
    var files = this.state.files || [];

    var filesElements: any;
    if (this.state.isLoadingFiles) {
      filesElements = <div>(Loading...)</div>;
    } else if (files.length === 0) {
      filesElements = <div>(No files)</div>;
    } else {
      filesElements = (
        <MaterialList.Component
          items={files.map((file) => {
            return {
              id: file.id,
              label: file.name,
              href: "?doc=" + file.id
            };
          })}
        />
      );
    }

    return (
      <React.Fragment>
        <div>Signed in as {this.props.datastore.currentUserEmail() || "<none>"}</div>
        <p/>
        {this.renderButton("Sign out", this.onClickSignOut)}
        <p/>
        {filesElements}
        <p/>
        {this.renderButton("Save", this.onClickSave)}
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

  private onClickSave = () => {
    if (this.props.actionManager) {
      this.props.actionManager.onClickSaveDocument();
    }
  }
}

export default FilesDrawerView;
