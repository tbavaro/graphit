import * as React from 'react';
import './PropertiesView.css';
import DrawerView from './DrawerView';

interface MyActions {
  onClickSaveDocument: () => void;
}

interface Props {
  actionManager: MyActions;
}

class PropertiesView extends React.PureComponent<Props, object> {
  render() {
    return (
      <DrawerView contentsClassName="PropertiesView-contents">
          <div className="PropertiesView-actionButton button" onClick={this.props.actionManager.onClickSaveDocument}>
            Save
          </div>
      </DrawerView>
    );
  }
}

export default PropertiesView;
