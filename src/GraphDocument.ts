import * as D3Force from 'd3-force';
import MyNodeDatum from './MyNodeDatum';

interface SerializedGraphDocument {
  nodes: SerializedNode[];
  links: SerializedLink[];
}

interface SerializedNode {
  id: string;
  label: string;
  isLocked?: boolean;
  x?: number;
  y?: number;
}

interface SerializedLink {
  source: string;
  target: string;
}

type MyLinkDatum = D3Force.SimulationLinkDatum<MyNodeDatum>;

function readNullableValue<T>(value: T | undefined | null): T | undefined {
  return (value === null) ? undefined : value;
}

function removeNullsAndUndefineds<T>(object: T): T {
  for (var propName in object) {
    if (object[propName] === null || object[propName] === undefined) {
      delete object[propName];
    }
  }

  return object;
}

class GraphDocument {
  nodes: MyNodeDatum[];
  links: MyLinkDatum[];

  static load(jsonData: string) {
    var data = JSON.parse(jsonData) as SerializedGraphDocument;
    var serializedNodes = data.nodes;
    var serializedLinks = data.links;
    if (serializedNodes === undefined || serializedLinks === undefined) {
      throw new Error("poorly formed document: " + jsonData);
    }

    var nodeMap = new Map<String, MyNodeDatum>();
    var nodes: MyNodeDatum[] = serializedNodes.map((sn: SerializedNode) => {
      var node: MyNodeDatum = {
        id: sn.id,
        label: sn.label,
        isLocked: readNullableValue(sn.isLocked) || false,
        x: readNullableValue(sn.x),
        y: readNullableValue(sn.y)
      };

      if (node.isLocked) {
        node.fx = node.x;
        node.fy = node.y;
      }

      nodeMap.set(sn.id, node);
      return node;
    });
    var links: MyLinkDatum[] = serializedLinks.map((sl: SerializedLink) => {
      return {
        source: nodeMap.get(sl.source) as MyNodeDatum,
        target: nodeMap.get(sl.target) as MyNodeDatum
      };
    });

    return new GraphDocument(nodes, links);
  }

  constructor(nodes?: MyNodeDatum[], links?: D3Force.SimulationLinkDatum<MyNodeDatum>[]) {
    this.nodes = nodes || [];
    this.links = links || [];
  }

  save(): string {
    var data: SerializedGraphDocument = {
      nodes: this.nodes.map(this.serializeNode),
      links: this.links.map(this.serializeLink)
    };

    return JSON.stringify(data, null, 2);
  }

  private serializeNode = (node: MyNodeDatum): SerializedNode => {
    return removeNullsAndUndefineds({
      id: node.id,
      label: node.label,
      isLocked: node.isLocked,
      x: node.x,
      y: node.y
    });
  }

  private serializeLink = (link: MyLinkDatum): SerializedLink => {
    return removeNullsAndUndefineds({
      source: (link.source as MyNodeDatum).id,
      target: (link.target as MyNodeDatum).id
    });
  }
}

export default GraphDocument;
