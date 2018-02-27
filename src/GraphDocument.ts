import * as D3Force from 'd3-force';
import MyNodeDatum from './MyNodeDatum';

class GraphDocument {
  nodes: MyNodeDatum[];
  links: D3Force.SimulationLinkDatum<MyNodeDatum>[];

  static load(jsonData: string) {
    return new GraphDocument([], []);
  }

  constructor(nodes?: MyNodeDatum[], links?: D3Force.SimulationLinkDatum<MyNodeDatum>[]) {
    this.nodes = nodes || [];
    this.links = links || [];
  }
}

export default GraphDocument;
