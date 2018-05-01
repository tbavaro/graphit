import * as React from 'react';
import * as D3 from "d3";
import * as D3Force from 'd3-force';
import { MyLinkDatum, MyNodeDatum } from './data/MyNodeDatum';
import { Component as NodeView } from './NodeView';
import { NodeActionManager } from './NodeView';
import './SimulationViewport.css';
import { GraphDocument } from './data/GraphDocument';
import * as Viewport from './ui-helpers/Viewport';
import { ListenerPureComponent, ListenerBinding } from './ui-helpers/ListenerPureComponent';
import { ListenableSimulationWrapper } from './ListenableSimulation';
import { SimpleListenable } from './data/Listenable';
import * as LinkRenderers from './LinkRenderers';
import * as GraphData from './data/GraphData';

export interface Props {
  document: GraphDocument;
  simulationConfigListener: SimpleListenable;
}

// TODO separate this out
class FPSView {
  private element?: HTMLDivElement;
  private ticksSinceUpdate: number;
  private lastUpdateTime: number;
  private intervalId?: number;

  constructor() {
    this.element = document.createElement("div");
    this.element.className = "SimulationViewport-FPSView";
    document.body.appendChild(this.element);
    this.ticksSinceUpdate = 0;
    this.lastUpdateTime = new Date().getTime();
    this.intervalId = window.setInterval(this.update, 1000);
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
  links: MyLinkDatum[];
  gRef?: (newRef: SVGGElement) => void;
  onClick?: () => void;
}

class SVGLinesComponent extends React.PureComponent<SVGLinesComponentProps, {}> {
  linkRenderer = new LinkRenderers.MiddleArrowDirectedLinkRenderer();

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
          {this.linkRenderer.renderLinks(this.props.links)}
        </g>
      </svg>
    );
  }

  public updatePositions() {
    if (this._gRef) {
      this.linkRenderer.updateLinkElements(this._gRef, this.props.links);
    }
  }

  private _setGRef = (newRef: SVGGElement) => {
    this._gRef = newRef;
    if (this.props.gRef) {
      this.props.gRef(newRef);
    }
  }
}

type GraphViewportProps = {
  nodes: MyNodeDatum[];
  links: MyLinkDatum[];
  zoomState: GraphData.ZoomState;
  nodeRenderMode: GraphData.DisplayConfig["nodeRenderMode"];
  restartSimulation: () => void;  // TODO rename to be more generic
};

type GraphViewportState = {
  selectedNodes: Set<MyNodeDatum>;
};

class GraphViewport extends React.PureComponent<GraphViewportProps, {}> {
  state: GraphViewportState = {
    selectedNodes: new Set()
  };

  private renderNodes = true;
  private renderLinks = true;

  private linksViewRef: SVGLinesComponent | null = null;
  private svgRef: SVGGElement | null = null;
  private nodeRefs: Array<NodeView | null> = [];
  private drag = D3.drag<any, any, number>();

  private nodeActionManager: NodeActionManager = {
    onNodeMoved: (index: number, x: number, y: number, stopped: boolean) => {
      var node = this.props.nodes[index];
      node.x = x;
      node.y = y;
      if (stopped && !node.isLocked) {
        node.fx = undefined;
        node.fy = undefined;
      } else {
        node.fx = x;
        node.fy = y;
      }
      this.props.restartSimulation();
    },

    toggleIsLocked: (id: number) => {
      var node = this.props.nodes[id];
      node.isLocked = !node.isLocked;
      node.fx = (node.isLocked ? node.x : undefined);
      node.fy = (node.isLocked ? node.y : undefined);
      this.props.restartSimulation();
      this.forceUpdate();
    }
  };

  componentWillMount() {
    this.reconfigure();
    if (super.componentWillMount) {
      super.componentWillMount();
    }
  }

  componentWillReceiveProps?(nextProps: Readonly<GraphViewportProps>, nextContext: any): void {
    this.reconfigure();
    if (super.componentWillReceiveProps) {
      super.componentWillReceiveProps(nextProps, nextContext);
    }
  }

  public render() {
    var nodeViews = (!this.renderNodes ? "" : this.props.nodes.map(this.renderNode));

    return (
      <Viewport.Viewport
        manuallyTransformedChildren={
          this.renderLinks
            ? (
                <SVGLinesComponent
                  ref={this.setLinksViewRef}
                  links={this.props.links}
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
        initialZoomState={this.props.zoomState}
      />
    );
  }

  private setLinksViewRef = (newRef: SVGLinesComponent | null) => this.linksViewRef = newRef;

  private reconfigure() {
    if (this.nodeRefs.length !== this.props.nodes.length) {
      const oldNodeRefs = this.nodeRefs;
      this.nodeRefs = this.props.nodes.map((_, i) => (i < oldNodeRefs.length ? oldNodeRefs[i] : null));
    }
  }

  private renderNode = (node: MyNodeDatum, index: number) => {
    return (
      <NodeView
        key={"node." + index}
        ref={(newRef) => this.nodeRefs[index] = newRef}
        actionManager={this.nodeActionManager}
        id={index}
        label={node.label}
        isLocked={node.isLocked}
        color={node.color || undefined}
        renderMode={this.props.nodeRenderMode}
        initialX={node.x || 0}
        initialY={node.y || 0}
        isSelected={this.state.selectedNodes.has(node)}
        dragBehavior={this.drag}
      />
    );
  }

  public updatePositions() {
    for (var i = 0; i < this.nodeRefs.length; ++i) {
      const nodeRef = this.nodeRefs[i];
      if (nodeRef !== null) {
        const node = this.props.nodes[i];
        nodeRef.setPosition(node.x || 0, node.y || 0);
      }
    }
    if (this.linksViewRef !== null) {
      this.linksViewRef.updatePositions();
    }
  }

  private setSvgRef = (newRef: SVGGElement | null) => {
    this.svgRef = newRef;
  }

  private onViewportZoom = (zoomState: Viewport.ZoomState, transform: string) => {
    const dzs = this.props.zoomState;
    dzs.centerX = zoomState.centerX;
    dzs.centerY = zoomState.centerY;
    dzs.scale = zoomState.scale;

    if (this.svgRef) {
      this.svgRef.style.transform = transform;
    }
  }

  private onDrag = (index: number, dx: number, dy: number, isEnd: boolean) => {
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
      this.props.restartSimulation();
    }
  }

  private onDragStart = (index: number, metaKey: boolean) => {
    var node = this.props.nodes[index];

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

class SimulationViewport extends ListenerPureComponent<Props, {}> {
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

  simulation: MySimulation = D3.forceSimulation<MyNodeDatum, MyLinkDatum>();
  simulationWrapper = new ListenableSimulationWrapper(this.simulation);

  private graphViewportRef: GraphViewport | null = null;

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
    return (
      <GraphViewport
        ref={this.setGraphViewportRef}
        nodes={this.props.document.nodes}
        links={this.props.document.links}
        zoomState={this.props.document.zoomState}
        nodeRenderMode={this.props.document.displayConfig.nodeRenderMode}
        restartSimulation={this.restartSimulation}
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

  private onSimulationTick = () => {
    if (this.fpsView) {
      this.fpsView.onTick();
    }
    if (this.graphViewportRef) {
      this.graphViewportRef.updatePositions();
    }
  }

  private setGraphViewportRef = (newRef: GraphViewport | null) => this.graphViewportRef = newRef;
}

export default SimulationViewport;
