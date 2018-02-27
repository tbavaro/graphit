import * as d3 from 'd3-force';

interface MyNodeDatum extends d3.SimulationNodeDatum {
  label: string;
  isLocked: boolean;
}

export default MyNodeDatum;
