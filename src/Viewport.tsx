import * as React from 'react';
import * as D3Force from 'd3-force';
import MyNodeDatum from './MyNodeDatum';
import NodeView from './NodeView';
import { NodeActionManager } from './NodeView';
import './Viewport.css';
import GraphDocument from './GraphDocument';

interface Props {
  document: GraphDocument;
}

class Viewport extends React.Component<Props, object> {
  zoom = 1;

  maxInitialized = false;
  maxX = 0;
  maxY = 0;
  maxXId = -1;
  maxYId = -1;

  simulation =
    D3Force.forceSimulation(this.props.document.nodes)
      .force("charge", D3Force.forceManyBody())
      .force("links", D3Force.forceLink(this.props.document.links).distance(100))
      .on("tick", () => this.onSimulationTick());

  nodeActionManager: NodeActionManager = {
    onNodeMoved: (id: number, x: number, y: number, stopped: boolean) => {
      var node = this.props.document.nodes[id];
      node.x = x;
      node.y = y;
      if (stopped && !node.isLocked) {
        node.fx = undefined;
        node.fy = undefined;
      } else {
        node.fx = x;
        node.fy = y;
      }
      this.updateBoundsForNode(node, id);
      this.restartSimulation();
    },

    toggleIsLocked: (id: number) => {
      var node = this.props.document.nodes[id];
      node.isLocked = !node.isLocked;
      node.fx = (node.isLocked ? node.x : undefined);
      node.fy = (node.isLocked ? node.y : undefined);
      this.restartSimulation();
      this.forceUpdate();
    }
  };

  componentWillReceiveProps(nextProps: Readonly<Props>) {
    // TODO this is kind of a hack that modifies them in-place
    nextProps.document.nodes.forEach((node: MyNodeDatum) => {
      if (node.isLocked) {
        node.fx = node.x;
        node.fy = node.y;
      }
    });
  }

  componentWillUnmount() {
    this.simulation.stop();
  }

  render() {
    if (!this.maxInitialized) {
      this.updateBoundsForAllNodes();
      this.maxInitialized = true;
    }

    var linkLines = this.props.document.links.map(this.renderLink);
    var nodeViews = this.props.document.nodes.map(this.renderNode);

    var maxX = 0;
    var maxY = 0;
    this.props.document.nodes.forEach((node) => {
      if (node.x && node.x > maxX) {
        maxX = node.x;
      }
      if (node.y && node.y > maxY) {
        maxY = node.y;
      }
    });

    var innerStyle = {
      zoom: this.zoom
    };

    return (
      <div className="Viewport">
        <div className="Viewport-inner" style={innerStyle}>
          <svg className="Viewport-linkLines" width={maxX + "px"} height={maxY + "px"}>
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

  private updateBoundsForAllNodes = () => {
    this.maxX = 0;
    this.maxY = 0;
    this.maxXId = -1;
    this.maxYId = -1;
    this.props.document.nodes.forEach(this.updateBoundsForNode);
  }

  // returns TRUE if the given node might have been on the bounds before but isn't now
  private updateBoundsForNode = (node: MyNodeDatum, id: number): boolean => {
    var result = false;
    if (node.x) {
      if (node.x > this.maxX) {
        this.maxX = node.x;
        this.maxXId = id;
      } else {
        result = result || (this.maxXId === id);
      }
    }
    if (node.y) {
      if (node.y > this.maxY) {
        this.maxY = node.y;
        this.maxYId = id;
      } else {
        result = result || (this.maxYId === id);
      }
    }
    return result;
  }
}

export default Viewport;
