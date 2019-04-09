import * as d3 from "d3-force";
import * as GraphData from "./GraphData";

export interface MyNodeDatum extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  isLocked: boolean;
  color?: string | null;
}

export type MyLinkDatum = d3.SimulationLinkDatum<MyNodeDatum> & {
  // force these to always be with the MyNodeDatum and not the optional string/number
  source: MyNodeDatum;
  target: MyNodeDatum;
  stroke: GraphData.LinkStroke;
};
