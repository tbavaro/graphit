import { MyLinkDatum, MyNodeDatum } from './MyNodeDatum';
import { SimplePartialDeserializer, DeepPartial } from './Deserializers';

export const DEFAULT_LAYOUT_TYPE = "force_simulation";
export const DEFAULT_PARTICLE_CHARGE = 500;

interface SerializedGraphDocument {
  nodes?: SerializedNode[];
  links?: SerializedLink[];
  zoomState?: SerializedZoomState;
  layoutState?: DeepPartial<LayoutState>;
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

const zoomStateDeserializer = new SimplePartialDeserializer<ZoomState>(
  () => {
    return {
      centerX: 0,
      centerY: 0,
      scale: 1
    };
  }
);

export interface ForceSimulationConfig {
  particleCharge: number;
}

const forceSimulationConfigDeserializer = new SimplePartialDeserializer<ForceSimulationConfig>(
  () => {
    return {
      particleCharge: DEFAULT_PARTICLE_CHARGE
    };
  }
);

export interface LayoutState {
  layoutType: "force_simulation";
  forceSimulationConfig: ForceSimulationConfig;
}

const layoutStateDeserializer = new SimplePartialDeserializer<LayoutState>(
  () => {
    return {
      layoutType: DEFAULT_LAYOUT_TYPE,
      forceSimulationConfig: forceSimulationConfigDeserializer.defaultValueFactory()
    };
  },
  {
    forceSimulationConfig: forceSimulationConfigDeserializer
  }
);

export class GraphDocument {
  name: string = "Untitled";
  nodes: MyNodeDatum[] = [];
  links: MyLinkDatum[] = [];
  zoomState: ZoomState = zoomStateDeserializer.defaultValueFactory();
  layoutState: LayoutState = layoutStateDeserializer.defaultValueFactory();

  static empty() {
    return this.load("{}");
  }

  static load(jsonData: string, name?: string) {
    var data = JSON.parse(jsonData) as SerializedGraphDocument;
    var serializedNodes = data.nodes || [];
    var serializedLinks = data.links || [];

    var nodeMap = new Map<String, MyNodeDatum>();

    var document = new GraphDocument();
    document.nodes = serializedNodes.map((sn: SerializedNode) => {
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
    document.links = serializedLinks.map((sl: SerializedLink) => {
      return {
        source: nodeMap.get(sl.source) as MyNodeDatum,
        target: nodeMap.get(sl.target) as MyNodeDatum
      };
    });
    document.zoomState = zoomStateDeserializer.deserialize(data.zoomState);
    document.layoutState = layoutStateDeserializer.deserialize(data.layoutState);
    if (name !== undefined) {
      document.name = name;
    }

    return document;
  }

  private constructor() {}

  save(): string {
    var data: SerializedGraphDocument = {
      nodes: this.nodes.map(this.serializeNode),
      links: this.links.map(this.serializeLink),
      zoomState: this.zoomState,
      layoutState: this.layoutState
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
