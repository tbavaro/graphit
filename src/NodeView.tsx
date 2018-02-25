import * as React from 'react';
// import MyNodeDatum from './MyNodeDatum';
import './NodeView.css';

interface Props {
  label: string;
  x: number;
  y: number;
}

class NodeView extends React.Component<Props, object> {
  render() {
    var style = {
      left: this.props.x,
      top: this.props.y
    };
    return (
      <div className="NodeView" style={style}>{this.props.label}</div>
    );
  }
}

export default NodeView;
