import * as React from 'react';
import './FilesDrawerView.css';
import DrawerView from './DrawerView';
import { Datastore, DatastoreStatus, DatastoreFileResult } from "./Datastore";

// interface MyActions {
//   onClickSaveDocument: () => void;
// }

interface Props {
  datastore: Datastore;
  datastoreStatus: DatastoreStatus;
  isExpandedByDefault?: boolean;
  // actionManager: MyActions;
}

interface State {
  isLoadingFiles: boolean;
  files?: DatastoreFileResult[];
}

class FilesDrawerView extends React.PureComponent<Props, State> {
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
      <DrawerView
        contentsClassName="FilesDrawerView-contents"
        isLeftDrawer={true}
        isExpandedByDefault={this.props.isExpandedByDefault}
      >
        {contents}
      </DrawerView>
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
      filesElements = files.map(this.renderDocumentListItem);
    }

    return (
      <React.Fragment>
        <div>Signed in as {this.props.datastore.currentUserEmail() || "<none>"}</div>
        <p/>
        {this.renderButton("Sign out", this.onClickSignOut)}
        <p/>
        <ul className="FilesDrawerView-filesList">
          {filesElements}
        </ul>
      </React.Fragment>
    );
  }

  private renderDocumentListItem = (file: DatastoreFileResult) => {
    return (
      <a key={"file:" + file.id} href={"?doc=" + file.id}>
        {file.name}
      </a>
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
}

export default FilesDrawerView;
