import * as React from 'react';
import './DrawerView.css';

/**
 * `props.contentsClassName` should be a class with at least these properties specified:
 *   - width
 *   - backgroundColor
 */

interface Props {
  children: any;
  contentsClassName: string;
}

interface State {
  isExpanded: boolean;
}

class DrawerView extends React.Component<Props, State> {
  state: State = {
    isExpanded: false
  };

  render() {
    var className = "DrawerView " + (this.state.isExpanded ? "expanded" : "collapsed");
    return (
      <div className={className}>
        <div
          className="DrawerView-expandButton button"
          onClick={this.toggleIsExpanded}
        >
          {this.state.isExpanded ? "\u00bb" : "\u00ab"}
        </div>
        <div className={"DrawerView-contents " + this.props.contentsClassName}>
          {this.props.children}
        </div>
      </div>
    );
  }

  private toggleIsExpanded = () => {
    this.setState({ isExpanded: !this.state.isExpanded });
  }
}

export default DrawerView;
