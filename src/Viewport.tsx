import * as React from 'react';
import * as D3Force from 'd3-force';
import MyNodeDatum from './MyNodeDatum';
import NodeView from './NodeView';
import { NodeActionManager } from './NodeView';
import './Viewport.css';

class Viewport extends React.Component {
  nodes: MyNodeDatum[] = [
    {
      label: "a",
      x: 100,
      y: 100
    },
    {
      label: "b",
      x: 200,
      y: 100
    },
    {
      label: "c",
      x: 150,
      y: 200
    }
  ];

  links: D3Force.SimulationLinkDatum<MyNodeDatum>[] = [
    {
      source: 0,
      target: 1
    },
    {
      source: 1,
      target: 2
    },
    {
      source: 2,
      target: 0
    }
  ];

  simulation =
    D3Force.forceSimulation(this.nodes)
      .force("charge", D3Force.forceManyBody())
      .force("links", D3Force.forceLink(this.links).distance(100))
      .on("tick", () => this.onSimulationTick());

  nodeActionManager: NodeActionManager = {
    onNodeMoved: (id: number, x: number, y: number, stopped: boolean) => {
      this.nodes[id].x = x;
      this.nodes[id].y = y;
      if (stopped) {
        this.nodes[id].fx = undefined;
        this.nodes[id].fy = undefined;
      } else {
        this.nodes[id].fx = x;
        this.nodes[id].fy = y;
      }
      this.simulation.alpha(1);
      if (stopped) {
        this.simulation.restart();
      }
    }
  };

  componentWillUnmount() {
    this.simulation.stop();
  }

  render() {
    var nodeViews = this.nodes.map(this.renderNode);

    return (
      <div className="Viewport">
        {nodeViews}
      </div>
    );
  }

  private renderNode = (node: MyNodeDatum, id: number) => {
    return (
      <NodeView
        key={"node." + id}
        actionManager={this.nodeActionManager}
        id={id}
        label={node.label}
        x={node.x || 0}
        y={node.y || 0}
      />
    );
  }

  private onSimulationTick = () => {
    // console.log("tick");
    this.forceUpdate();
  }
}

export default Viewport;
