import * as React from 'react';
import './PropertiesView.css';
import DrawerView from './DrawerView';

interface MyActions {
  /* */
}

interface Props {
  actionManager: MyActions;
}

class PropertiesView extends React.PureComponent<Props, object> {
  render() {
    return (
      <DrawerView contentsClassName="PropertiesView-contents" />
    );
  }
}

export default PropertiesView;
