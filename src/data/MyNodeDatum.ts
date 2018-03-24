import * as d3 from 'd3-force';

export interface MyNodeDatum extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  isLocked: boolean;
  color?: string | null;
}

export type MyLinkDatum = d3.SimulationLinkDatum<MyNodeDatum>;
