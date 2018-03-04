import * as React from 'react';
import './FilesDrawerView.css';
import DrawerView from './DrawerView';
import { Datastore, DatastoreStatus } from "./Datastore";

// interface MyActions {
//   onClickSaveDocument: () => void;
// }

interface Props {
  datastore: Datastore;
  datastoreStatus: DatastoreStatus;
  // actionManager: MyActions;
}

class FilesDrawerView extends React.PureComponent<Props, object> {
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
      <DrawerView contentsClassName="FilesDrawerView-contents" isLeftDrawer={true}>
        {contents}
      </DrawerView>
    );
  }

  private renderInitializingContents() {
    return "Connecting to Google...";
  }

  private renderSignedInContents() {
    return [
      this.renderButton("Sign out", this.onClickSignOut, "button:sign-out")
    ];
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
