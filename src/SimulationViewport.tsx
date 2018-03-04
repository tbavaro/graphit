import * as React from 'react';
import * as D3 from "d3";
import * as D3Force from 'd3-force';
import MyNodeDatum from './MyNodeDatum';
import NodeView from './NodeView';
import { NodeActionManager } from './NodeView';
import './SimulationViewport.css';
import GraphDocument from './GraphDocument';
import Viewport from './Viewport';

interface Props {
  document: GraphDocument;
}

// TODO separate this out
class FPSView {
  private element?: HTMLDivElement;
  private ticksSinceUpdate: number;
  private lastUpdateTime: number;
  private intervalId?: NodeJS.Timer;

  constructor() {
    this.element = document.createElement("div");
    this.element.className = "SimulationViewport-FPSView";
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

class SimulationViewport extends React.Component<Props, object> {
  fpsView?: FPSView;

  svgRef?: SVGGElement;

  renderNodes = true;
  renderLinks = true;

  simulation = D3.forceSimulation();

  drag = D3.drag<any, any, number>();
    // .on("drag", this.onDragMove);

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

  componentDidMount() {
    this.fpsView = new FPSView();

    this.simulation = D3Force.forceSimulation(this.props.document.nodes)
      .force("charge", D3Force.forceManyBody().strength(-500).distanceMax(300))
      .force("links", D3Force.forceLink(this.props.document.links).distance(100))
      .on("tick", () => this.onSimulationTick());
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

    return (
      <Viewport
        manuallyTransformedChildren={
          <svg
            key="linkLines"
            className="SimulationViewport-linkLines"
          >
            <g ref={this.setSvgRef}>
              {linkLines}
            </g>
          </svg>
        }
        autoTransformedChildren={nodeViews}
        onZoom={this.onViewportZoom}
        dragBehavior={this.drag}
        onDrag={this.onDrag}
      />
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
        dragBehavior={this.drag}
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
    this.forceUpdate();
    if (this.fpsView) {
      this.fpsView.onTick();
    }
  }

  private setSvgRef = (newRef: SVGGElement) => {
    this.svgRef = newRef;
  }

  private onViewportZoom = (transform: string) => {
    if (this.svgRef) {
      this.svgRef.style.transform = transform;
    }
  }

  private onDrag = (id: number, dx: number, dy: number, isEnd: boolean) => {
    var node = this.props.document.nodes[id];
    node.x = (node.x || 0) + dx;
    node.y = (node.y || 0) + dy;
    if (isEnd && !node.isLocked) {
      node.fx = undefined;
      node.fy = undefined;
    } else {
      node.fx = node.x;
      node.fy = node.y;
    }

    if (dx !== 0 || dy !== 0) {
      this.restartSimulation();
    }
  }
}

export default SimulationViewport;
