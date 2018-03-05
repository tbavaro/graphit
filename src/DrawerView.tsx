import * as React from 'react';
import * as classNames from "classnames";
import './DrawerView.css';

/**
 * `props.contentsClassName` should be a class with at least these properties specified:
 *   - width
 *   - backgroundColor
 */

interface Props {
  children?: any;
  contentsClassName: string;
  isLeftDrawer?: boolean;
  isExpandedByDefault?: boolean;
}

interface State {
  isExpanded: boolean;
}

class DrawerView extends React.Component<Props, State> {
  state: State = {
    isExpanded: this.props.isExpandedByDefault || false
  };

  render() {
    var className = classNames([
      "DrawerView",
      this.props.isLeftDrawer ? "isLeftDrawer" : null,
      this.state.isExpanded ? "expanded" : "collapsed"
    ]);
    var showLeftArrow = this.state.isExpanded !== (this.props.isLeftDrawer || false);
    return (
      <div className={className}>
        <div
          className="DrawerView-expandButton button"
          onClick={this.toggleIsExpanded}
        >
          {showLeftArrow ? "\u00bb" : "\u00ab"}
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
