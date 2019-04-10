import * as D3 from "d3";
import { BasicListenable } from "../data/Listenable";
import { MyLinkDatum, MyNodeDatum } from "../data/MyNodeDatum";

export type EventType = (
  "tick"
);

export type Simulation = D3.Simulation<MyNodeDatum, MyLinkDatum>;

export class ListenableSimulationWrapper extends BasicListenable<EventType> {
  private readonly simulation: Simulation;

  constructor(simulation: Simulation) {
    super();
    this.simulation = simulation;
    if (this.simulation.on("tick") !== undefined) {
      throw new Error("tick listener already specified");
    }
    this.simulation.on("tick", () => {
      this.triggerListeners("tick");
    });
    const originalOn = this.simulation.on;
    (this.simulation.on as any) = function(this: any) {
      if (arguments.length > 1 && arguments[0] === "tick") {
        throw new Error("can't set 'tick' listener on ListenableSimulation-managed simulation");
      }
      originalOn.call(this, arguments);
    };
  }
}
