import * as React from 'react';
import * as D3 from "d3";
import * as D3Force from 'd3-force';
import { MyLinkDatum, MyNodeDatum } from './MyNodeDatum';
import { ListenablePosition, Component as NodeView } from './NodeView';
import { NodeActionManager } from './NodeView';
import './SimulationViewport.css';
import GraphDocument from './GraphDocument';
import * as Viewport from './Viewport';
import { SimpleListenable, Listenable } from './Listenable';
import SingleListenerPureComponent from './SingleListenerPureComponent';

interface Props {
  document: GraphDocument;
  simulationForceCharge: number;
}

interface State {
  selectedNodes: Set<MyNodeDatum>;
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

function updateForces(simulation: D3.Simulation<any, any>, props: Props) {
  simulation
    .force("charge", D3Force.forceManyBody().strength(-1 * props.simulationForceCharge).distanceMax(300))
    .force("links", D3Force.forceLink(props.document.links).distance(100));
}

type MySimulation = D3.Simulation<MyNodeDatum, MyLinkDatum>;

interface SVGLinesComponentProps {
  document: GraphDocument;
  simulationTickListener: Listenable;
  gRef?: (newRef: SVGGElement) => void;
  onClick?: () => void;
}

class SVGLinesComponent extends SingleListenerPureComponent<SVGLinesComponentProps, object> {
  protected _listenerFieldName = "simulationTickListener";

  private _gRef?: SVGGElement;

  private static renderLink(link: D3Force.SimulationLinkDatum<MyNodeDatum>, id: number) {
    var source = link.source as MyNodeDatum;
    var target = link.target as MyNodeDatum;
    return (
      <line key={"link." + id} x1={source.x} y1={source.y} x2={target.x} y2={target.y}/>
    );
  }

  render() {
    var linkLines = this.props.document.links.map(SVGLinesComponent.renderLink);

    return (
      <svg
        key="linkLines"
        className="SimulationViewport-linkLines"
        onClick={this.props.onClick}
      >
        <g ref={this._setGRef}>
          {linkLines}
        </g>
      </svg>
    );
  }

  protected onSignal() {
    if (this._gRef) {
      var linkElements: SVGLineElement[] = (this._gRef.children as any);
      this.props.document.links.forEach((link, index) => {
        var linkElement = linkElements[index];
        var source = (link.source as MyNodeDatum);
        var target = (link.target as MyNodeDatum);
        linkElement.setAttribute("x1", (source.x || 0) + "px");
        linkElement.setAttribute("y1", (source.y || 0) + "px");
        linkElement.setAttribute("x2", (target.x || 0) + "px");
        linkElement.setAttribute("y2", (target.y || 0) + "px");
      });
    }
  }

  private _setGRef = (newRef: SVGGElement) => {
    this._gRef = newRef;
    if (this.props.gRef) {
      this.props.gRef(newRef);
    }
  }
}

class SimulationViewport extends React.Component<Props, State> {
  state: State = {
    selectedNodes: new Set()
  };

  fpsView?: FPSView;

  svgRef?: SVGGElement;

  renderNodes = true;
  renderLinks = true;

  simulation: MySimulation = D3.forceSimulation<MyNodeDatum, MyLinkDatum>();
  simulationTickListener: Listenable = new SimpleListenable();
  positions: ListenablePosition[] = [];

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
  }

  componentWillMount() {
    this.initializeSimulation(this.props.document);
    updateForces(this.simulation, this.props);
  }

  componentWillUnmount() {
    this.simulation.stop();
    if (this.fpsView) {
      this.fpsView.destroy();
      this.fpsView = undefined;
    }
  }

  componentWillReceiveProps(newProps: Props) {
    if (this.props.document !== newProps.document) {
      this.initializeSimulation(newProps.document);
    }

    updateForces(this.simulation, newProps);
    this.restartSimulation();
  }

  render() {
    var nodeViews = (!this.renderNodes ? "" : this.props.document.nodes.map(this.renderNode));

    return (
      <Viewport.Viewport
        manuallyTransformedChildren={
          this.renderLinks
            ? (
                <SVGLinesComponent
                  document={this.props.document}
                  simulationTickListener={this.simulationTickListener}
                  onClick={this.deselectAll}
                  gRef={this.setSvgRef}
                />
              )
            : ""
        }
        autoTransformedChildren={nodeViews}
        onZoom={this.onViewportZoom}
        dragBehavior={this.drag}
        onDrag={this.onDrag}
        onDragStart={this.onDragStart}
        initialZoomState={this.props.document.zoomState}
      />
    );
  }

  private initializeSimulation = (document: GraphDocument) => {
    this.positions = document.nodes.map((node) => {
      return new ListenablePosition(node.x || 0, node.y || 0);
    });
    this.simulation = D3Force.forceSimulation(document.nodes)
      .on("tick", () => this.onSimulationTick());
  }

  private restartSimulation = () => {
    this.simulation.alpha(1);
    this.simulation.restart();
  }

  private renderNode = (node: MyNodeDatum, index: number) => {
    return (
      <NodeView
        key={"node." + index}
        actionManager={this.nodeActionManager}
        id={index}
        label={node.label}
        isLocked={node.isLocked}
        position={this.positions[index]}
        isSelected={this.state.selectedNodes.has(node)}
        dragBehavior={this.drag}
      />
    );
  }

  private onSimulationTick = () => {
    this.props.document.nodes.forEach((node, index) => {
      this.positions[index].set(node.x || 0, node.y || 0);
    });

    this.simulationTickListener.signalUpdate();
    if (this.fpsView) {
      this.fpsView.onTick();
    }
  }

  private setSvgRef = (newRef: SVGGElement) => {
    this.svgRef = newRef;
  }

  private onViewportZoom = (zoomState: Viewport.ZoomState, transform: string) => {
    this.props.document.zoomState.centerX = zoomState.centerX;
    this.props.document.zoomState.centerY = zoomState.centerY;
    this.props.document.zoomState.scale = zoomState.scale;

    if (this.svgRef) {
      this.svgRef.style.transform = transform;
    }
  }

  private onDrag = (id: number, dx: number, dy: number, isEnd: boolean) => {
    this.state.selectedNodes.forEach((node) => {
      node.x = (node.x || 0) + dx;
      node.y = (node.y || 0) + dy;
      if (isEnd && !node.isLocked) {
        node.fx = undefined;
        node.fy = undefined;
      } else {
        node.fx = node.x;
        node.fy = node.y;
      }
    });

    if (dx !== 0 || dy !== 0) {
      this.restartSimulation();
    }
  }

  private onDragStart = (index: number, metaKey: boolean) => {
    var node = this.props.document.nodes[index];

    var newSelectedNodes: Set<MyNodeDatum> | undefined;
    if (!metaKey) {
      // if the node is already selected, don't do anything else
      if (!this.state.selectedNodes.has(node)) {
        newSelectedNodes = new Set([node]);
      }
    } else {
      newSelectedNodes = new Set(this.state.selectedNodes);
      if (newSelectedNodes.has(node) && newSelectedNodes.size > 1) {
        newSelectedNodes.delete(node);
      } else {
        newSelectedNodes.add(node);
      }
    }

    if (newSelectedNodes) {
      this.setState({
        selectedNodes: newSelectedNodes
      });
    }

    this.onDrag(index, 0, 0, false);
  }

  private deselectAll = () => {
    this.setState({
      selectedNodes: new Set()
    });
  }
}

export default SimulationViewport;
