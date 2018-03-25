import * as React from 'react';
import * as D3 from "d3";
import * as D3Force from 'd3-force';
import { MyLinkDatum, MyNodeDatum } from './data/MyNodeDatum';
import { Component as NodeView, Position } from './NodeView';
import { NodeActionManager } from './NodeView';
import './SimulationViewport.css';
import { GraphDocument } from './data/GraphDocument';
import * as Viewport from './ui-helpers/Viewport';
import { ListenerPureComponent, ListenerBinding } from './ui-helpers/ListenerPureComponent';
import { ListenableSimulationWrapper } from './ListenableSimulation';
import { SimpleListenable } from './data/Listenable';
import * as LinkRenderers from './LinkRenderers';

interface Props {
  document: GraphDocument;
  simulationConfigListener: SimpleListenable;
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
  const forceSimulationConfig = props.document.layoutState.forceSimulationConfig;
  simulation
    .force(
      "x",
      D3Force.forceX().strength(forceSimulationConfig.originPullStrength)
    )
    .force(
      "y",
      D3Force.forceY().strength(forceSimulationConfig.originPullStrength)
    )
    .force(
      "charge",
      D3Force.forceManyBody()
        .strength(-1 * forceSimulationConfig.particleCharge)
        .distanceMax(forceSimulationConfig.chargeDistanceMax)
    )
    .force("links", D3Force.forceLink(props.document.links).distance(forceSimulationConfig.linkDistance));
}

type MySimulation = D3.Simulation<MyNodeDatum, MyLinkDatum>;

interface SVGLinesComponentProps {
  document: GraphDocument;
  simulation: ListenableSimulationWrapper;
  gRef?: (newRef: SVGGElement) => void;
  onClick?: () => void;
}

class SVGLinesComponent extends ListenerPureComponent<SVGLinesComponentProps, object> {
  linkRenderer = new LinkRenderers.MiddleArrowDirectedLinkRenderer();

  protected readonly bindings: ListenerBinding<SVGLinesComponentProps>[] = [
    {
      propertyName: "simulation",
      eventType: "tick",
      callback: () => this.onSignal()
    }
  ];

  private _gRef?: SVGGElement;

  render() {
    return (
      <svg
        key="linkLines"
        className="SimulationViewport-linkLines"
        onClick={this.props.onClick}
      >
        <defs>
          {this.linkRenderer.renderDefs()}
        </defs>
        <g ref={this._setGRef} style={this.linkRenderer.parentStyle()}>
          {this.linkRenderer.renderLinks(this.props.document.links)}
        </g>
      </svg>
    );
  }

  protected onSignal() {
    if (this._gRef) {
      this.linkRenderer.updateLinkElements(this._gRef, this.props.document.links);
    }
  }

  private _setGRef = (newRef: SVGGElement) => {
    this._gRef = newRef;
    if (this.props.gRef) {
      this.props.gRef(newRef);
    }
  }
}

class SimulationViewport extends ListenerPureComponent<Props, State> {
  state: State = {
    selectedNodes: new Set()
  };

  bindings: ListenerBinding<Props>[] = [
    {
      propertyName: "simulationConfigListener",
      eventType: "changed",
      callback: () => {
        updateForces(this.simulation, this.props);
        this.restartSimulation();
      }
    }
  ];

  fpsView?: FPSView;

  svgRef?: SVGGElement;

  renderNodes = true;
  renderLinks = true;

  simulation: MySimulation = D3.forceSimulation<MyNodeDatum, MyLinkDatum>();
  simulationWrapper = new ListenableSimulationWrapper(this.simulation);

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
    if (super.componentDidMount) {
      super.componentDidMount();
    }
    this.fpsView = new FPSView();
  }

  componentWillMount() {
    super.componentWillMount();
    this.initializeSimulation(this.props.document);
    this.simulationWrapper.addListener("tick", this.onSimulationTick);
    updateForces(this.simulation, this.props);
  }

  componentWillUnmount() {
    super.componentWillUnmount();
    this.simulation.stop();
    if (this.fpsView) {
      this.fpsView.destroy();
      this.fpsView = undefined;
    }
  }

  componentWillReceiveProps(newProps: Props) {
    super.componentWillReceiveProps(newProps);
    if (this.props.document !== newProps.document) {
      this.initializeSimulation(newProps.document);
      updateForces(this.simulation, newProps);
      this.restartSimulation();
    }
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
                  simulation={this.simulationWrapper}
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
    this.simulation.nodes(document.nodes);
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
        color={node.color || undefined}
        renderMode={this.props.document.displayConfig.nodeRenderMode}
        position={node as Position}
        simulation={this.simulationWrapper}
        isSelected={this.state.selectedNodes.has(node)}
        dragBehavior={this.drag}
      />
    );
  }

  private onSimulationTick = () => {
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
      if (dx !== 0 || dy !== 0) {
        node.isLocked = true;
      }

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
    console.log("drag start", index);
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
