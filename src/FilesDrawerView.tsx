import * as React from 'react';
import './FilesDrawerView.css';
import DrawerView from './DrawerView';

// interface MyActions {
//   onClickSaveDocument: () => void;
// }

interface Props {
  // actionManager: MyActions;
}

class FilesDrawerView extends React.PureComponent<Props, object> {
  render() {
    return (
      <DrawerView contentsClassName="FilesDrawerView-contents" isLeftDrawer={true}/>
    );
  }
}

export default FilesDrawerView;
