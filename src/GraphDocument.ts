import * as D3Force from 'd3-force';
import MyNodeDatum from './MyNodeDatum';

interface SerializedGraphDocument {
  nodes: SerializedNode[];
  links: SerializedLink[];
  zoomState?: SerializedZoomState;
}

type SerializedZoomState = Partial<ZoomState>;

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

export interface ZoomState {
  centerX: number;
  centerY: number;
  scale: number;
}

function defaultZoomState() {
  return {
    centerX: 0,
    centerY: 0,
    scale: 1
  };
}

function deserializeZoomState(data?: SerializedZoomState): ZoomState {
  var result = defaultZoomState();
  if (data) {
    if (data.centerX !== undefined) {
      result.centerX = data.centerX;
    }
    if (data.centerY !== undefined) {
      result.centerY = data.centerY;
    }
    if (data.scale !== undefined) {
      result.scale = data.scale;
    }
  }
  return result;
}

class GraphDocument {
  nodes: MyNodeDatum[];
  links: MyLinkDatum[];
  zoomState: ZoomState;

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
    var zoomState = deserializeZoomState(data.zoomState);

    return new GraphDocument(nodes, links, zoomState);
  }

  constructor(nodes?: MyNodeDatum[], links?: D3Force.SimulationLinkDatum<MyNodeDatum>[], zoomState?: ZoomState) {
    this.nodes = nodes || [];
    this.links = links || [];
    this.zoomState = zoomState || defaultZoomState();
  }

  save(): string {
    var data: SerializedGraphDocument = {
      nodes: this.nodes.map(this.serializeNode),
      links: this.links.map(this.serializeLink),
      zoomState: this.zoomState
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
