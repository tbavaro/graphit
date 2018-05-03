import * as D3 from "d3";
import * as D3Force from "d3-force";
import * as React from "react";

import "./SimulationViewport.css";

import { GraphDocument } from "./data/GraphDocument";
import { SimpleListenable } from "./data/Listenable";
import { MyLinkDatum, MyNodeDatum } from "./data/MyNodeDatum";
import * as GraphViewport from "./GraphViewport";
import { ListenableSimulationWrapper } from "./ListenableSimulation";
import { ListenerBinding, ListenerPureComponent } from "./ui-helpers/ListenerPureComponent";

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

export class Component extends ListenerPureComponent<Props, {}> {
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

  private graphViewportRef: GraphViewport.Component | null = null;

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
      <GraphViewport.Component
        ref={this.setGraphViewportRef}
        nodes={this.props.document.nodes}
        links={this.props.document.links}
        zoomState={this.props.document.zoomState}
        nodeRenderMode={this.props.document.displayConfig.nodeRenderMode}
        onChange={this.restartSimulation}
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

  private setGraphViewportRef = (newRef: GraphViewport.Component | null) => {
    this.graphViewportRef = newRef;
  }
}
