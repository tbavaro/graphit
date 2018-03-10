import * as React from 'react';
import './PropertiesView.css';

interface MyActions {
  closePropertiesView: () => void;
}

interface Props {
  actionManager: MyActions;
  isOpen: boolean;
}

class PropertiesView extends React.PureComponent<Props, object> {
  render() {
    return (
      <div className={"PropertiesView" + (this.props.isOpen ? " open" : "")}>
        <div className="PropertiesView-header">
          Properties
          <div
            className="PropertiesView-header-closeButton material-icons"
            onClick={this.props.actionManager.closePropertiesView}
            children="close"
          />
        </div>
      </div>
    );
  }
}

export default PropertiesView;
