import * as React from 'react';
import * as D3Force from 'd3-force';
import MyNodeDatum from './MyNodeDatum';
import NodeView from './NodeView';
import { NodeActionManager } from './NodeView';
import './Viewport.css';

function lockLockedNodes(nodes: MyNodeDatum[]): MyNodeDatum[] {
  nodes.forEach((node: MyNodeDatum) => {
    if (node.isLocked) {
      node.fx = node.x;
      node.fy = node.y;
    }
  });
  return nodes;
}

class Viewport extends React.Component {
  zoom = 2;

  nodes: MyNodeDatum[] = lockLockedNodes([
    {
      label: "a",
      isLocked: true,
      x: 100,
      y: 100
    },
    {
      label: "b",
      isLocked: false,
      x: 200,
      y: 100
    },
    {
      label: "c",
      isLocked: false,
      x: 150,
      y: 200
    }
  ]);

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
      if (stopped && !this.nodes[id].isLocked) {
        this.nodes[id].fx = undefined;
        this.nodes[id].fy = undefined;
      } else {
        this.nodes[id].fx = x;
        this.nodes[id].fy = y;
      }
      this.restartSimulation();
    },

    toggleIsLocked: (id: number) => {
      var node = this.nodes[id];
      node.isLocked = !node.isLocked;
      node.fx = (node.isLocked ? node.x : undefined);
      node.fy = (node.isLocked ? node.y : undefined);
      this.restartSimulation();
      this.forceUpdate();
    }
  };

  componentWillUnmount() {
    this.simulation.stop();
  }

  render() {
    var linkLines = this.links.map(this.renderLink);
    var nodeViews = this.nodes.map(this.renderNode);

    var innerStyle = {
      zoom: this.zoom
    };

    return (
      <div className="Viewport">
        <div className="Viewport-inner" style={innerStyle}>
          <svg className="Viewport-linkLines">
            {linkLines}
          </svg>
          {nodeViews}
        </div>
      </div>
    );
  }

  private restartSimulation = () => {
    this.simulation.alpha(1);
    this.simulation.restart();
  }

  private renderNode = (node: MyNodeDatum, id: number) => {
    return (
      <NodeView
        key={"node." + id}
        actionManager={this.nodeActionManager}
        id={id}
        label={node.label}
        isLocked={node.isLocked}
        x={node.x || 0}
        y={node.y || 0}
        viewportZoom={this.zoom}
      />
    );
  }

  private renderLink = (link: D3Force.SimulationLinkDatum<MyNodeDatum>, id: number) => {
    var source = link.source as MyNodeDatum;
    var target = link.target as MyNodeDatum;
    return (
      <line x1={source.x} y1={source.y} x2={target.x} y2={target.y}/>
    );
  }

  private onSimulationTick = () => {
    // console.log("tick");
    this.forceUpdate();
  }
}

export default Viewport;
