import * as React from 'react';
import * as D3Force from 'd3-force';
import MyNodeDatum from './MyNodeDatum';
import NodeView from './NodeView';
import { NodeActionManager } from './NodeView';
import './Simulation.css';
import GraphDocument from './GraphDocument';

interface Props {
  document: GraphDocument;
}

class FPSView {
  private element?: HTMLDivElement;
  private ticksSinceUpdate: number;
  private lastUpdateTime: number;
  private intervalId?: NodeJS.Timer;

  constructor() {
    this.element = document.createElement("div");
    this.element.className = "Simulation-FPSView";
    document.body.appendChild(this.element);
    this.ticksSinceUpdate = 0;
    this.lastUpdateTime = new Date().getTime();
    this.intervalId = setInterval(this.update, 1000);
  }

  destroy() {
    if (this.element) {
      if (this.element.parentElement) {
        this.element.parentElement.removeChild(this.element);
      }
      this.element = undefined;
    }
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }

  onTick() {
    this.ticksSinceUpdate += 1;
  }

  private update = () => {
    var now = new Date().getTime();
    var diff = now - this.lastUpdateTime;
    var fps = this.ticksSinceUpdate / (diff / 1000);
    if (this.element) {
      this.element.innerText = Math.floor(fps) + "fps";
    }
    this.ticksSinceUpdate = 0;
    this.lastUpdateTime = now;
  }
}

class Simulation extends React.Component<Props, object> {
  fpsView?: FPSView;

  renderNodes = true;
  renderLinks = true;

  simulation =
    D3Force.forceSimulation(this.props.document.nodes)
      .force("charge", D3Force.forceManyBody().strength(-500).distanceMax(300))
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

  componentDidMount() {
    this.fpsView = new FPSView();
  }

  componentWillUnmount() {
    this.simulation.stop();
    if (this.fpsView) {
      this.fpsView.destroy();
      this.fpsView = undefined;
    }
  }

  render() {
    var linkLines = (!this.renderLinks ? "" : this.props.document.links.map(this.renderLink));
    var nodeViews = (!this.renderNodes ? "" : this.props.document.nodes.map(this.renderNode));

    // figure out max sizes
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

    return [
      (
      <svg
        key="linkLines"
        className="Simulation-linkLines"
        width={maxX + "px"}
        height={maxY + "px"}
      >
        {linkLines}
      </svg>
      ),
      nodeViews
    ];
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
        viewportZoom={1}
      />
    );
  }

  private renderLink = (link: D3Force.SimulationLinkDatum<MyNodeDatum>, id: number) => {
    var source = link.source as MyNodeDatum;
    var target = link.target as MyNodeDatum;
    return (
      <line key={"link." + id} x1={source.x} y1={source.y} x2={target.x} y2={target.y}/>
    );
  }

  private onSimulationTick = () => {
    // console.log("tick");
    this.forceUpdate();
    if (this.fpsView) {
      this.fpsView.onTick();
    }
  }
}

export default Simulation;
