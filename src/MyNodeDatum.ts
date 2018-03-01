import * as d3 from 'd3-force';

interface MyNodeDatum extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  isLocked: boolean;
}

export default MyNodeDatum;
