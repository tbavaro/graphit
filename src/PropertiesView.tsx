import * as React from 'react';
import './PropertiesView.css';

interface MyActions {
  onClickSaveDocument: () => void;
}

interface Props {
  actionManager: MyActions;
}

interface State {
  isExpanded: boolean;
}

class PropertiesView extends React.PureComponent<Props, State> {
  state: State = {
    isExpanded: false
  };

  render() {
    var className = "PropertiesView " + (this.state.isExpanded ? "expanded" : "collapsed");
    return (
      <div className={className}>
        <div
          className="PropertiesView-expandButton button"
          onClick={this.toggleIsExpanded}
        >
          {this.state.isExpanded ? "\u00bb" : "\u00ab"}
        </div>
        <div className="PropertiesView-contents">
          <div className="PropertiesView-actionButton button" onClick={this.props.actionManager.onClickSaveDocument}>
            Save
          </div>
        </div>
      </div>
    );
  }

  private toggleIsExpanded = () => {
    this.setState({ isExpanded: !this.state.isExpanded });
  }
}

export default PropertiesView;
