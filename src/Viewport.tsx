import * as React from 'react';
import MyNodeDatum from './MyNodeDatum';
import NodeView from './NodeView';
import './Viewport.css';

class Viewport extends React.Component {
  render() {
    var nodes: MyNodeDatum[] = [
      {
        label: "a",
        x: 100,
        y: 100
      },
      {
        label: "b",
        x: 200,
        y: 100
      }
    ];

    var nodeViews = nodes.map((node: MyNodeDatum, index: number) => {
      return this.renderNode(node, index);
    });

    return (
      <div className="Viewport">
        {nodeViews}
      </div>
    );
  }

  private renderNode(node: MyNodeDatum, key: string | number) {
    return (
      <NodeView key={key} label={node.label} x={node.x || 0} y={node.y || 0} />
    );
  }
}

export default Viewport;
