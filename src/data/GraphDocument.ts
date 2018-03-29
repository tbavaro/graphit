import { MyLinkDatum, MyNodeDatum } from './MyNodeDatum';
import { SimplePartialDeserializer, DeepPartial } from './Deserializers';

export const DEFAULT_LAYOUT_TYPE = "force_simulation";
export const DEFAULT_ORIGIN_PULL_STRENGTH = 0.001;
export const DEFAULT_PARTICLE_CHARGE = 500;
export const DEFAULT_CHARGE_DISTANCE_MAX = 300;
export const DEFAULT_LINK_DISTANCE = 100;

export interface SerializedGraphDocument {
  nodes?: SerializedNode[];
  links?: SerializedLink[];
  zoomState?: DeepPartial<ZoomState>;
  layoutState?: DeepPartial<LayoutState>;
  displayConfig?: DeepPartial<DisplayConfig>;
}

export interface SerializedNode {
  id: string;
  label: string;
  color?: string | null;
  isLocked?: boolean;
  x?: number;
  y?: number;
}

export interface SerializedLink {
  source: string;
  target: string;
}

function removeNullsAndUndefineds<T>(object: T): T {
  for (var propName in object) {
    if (object[propName] === null || object[propName] === undefined) {
      delete object[propName];
    }
  }

  return object;
}

const nodeDeserializer = new SimplePartialDeserializer<MyNodeDatum>({
  defaultValueFactory: () => {
    return {
      id: "",
      label: "",
      isLocked: false
    };
  }
});

export interface ZoomState {
  centerX: number;
  centerY: number;
  scale: number;
}

const zoomStateDeserializer = new SimplePartialDeserializer<ZoomState>({
  defaultValueFactory: () => {
    return {
      centerX: 0,
      centerY: 0,
      scale: 1
    };
  }
});

export interface ForceSimulationConfig {
  originPullStrength: number;
  particleCharge: number;
  chargeDistanceMax: number;
  linkDistance: number;
}

const forceSimulationConfigDeserializer = new SimplePartialDeserializer<ForceSimulationConfig>({
  defaultValueFactory: () => {
    return {
      originPullStrength: DEFAULT_ORIGIN_PULL_STRENGTH,
      particleCharge: DEFAULT_PARTICLE_CHARGE,
      chargeDistanceMax: DEFAULT_CHARGE_DISTANCE_MAX,
      linkDistance: DEFAULT_LINK_DISTANCE
    };
  }
});

export interface LayoutState {
  layoutType: "force_simulation";
  forceSimulationConfig: ForceSimulationConfig;
}

export enum NodeRenderMode {
  BASIC = "basic",
  RAW_HTML = "raw_html"
}

export interface DisplayConfig {
  nodeRenderMode: NodeRenderMode;
}

const displayConfigDeserializer = new SimplePartialDeserializer<DisplayConfig>({
  defaultValueFactory: () => {
    return {
      nodeRenderMode: NodeRenderMode.BASIC
    };
  }
});

const layoutStateDeserializer = new SimplePartialDeserializer<LayoutState>({
  defaultValueFactory: () => {
    return {
      layoutType: DEFAULT_LAYOUT_TYPE,
      forceSimulationConfig: forceSimulationConfigDeserializer.defaultValueFactory()
    };
  },
  specialFieldDeserializers: {
    forceSimulationConfig: forceSimulationConfigDeserializer
  }
});

export const internals = {
  mergeValueSimple: <T>(originalValue: T, newValue: T): T => {
    if (newValue === undefined) {
      return cloneViaSerialization(originalValue);
    } else if (isArrayOrPrimitive(originalValue) || isArrayOrPrimitive(newValue)) {
      return cloneViaSerialization(newValue);
    } else {
      var result = cloneViaSerialization(originalValue);
      Object.keys(newValue).forEach((key) => {
        result[key] = internals.mergeValueSimple(originalValue[key], newValue[key]);
      });
      return result;
    }
  },

  /**
   * Merge arrays, preserving old data fields when not supplied by new data, but
   * removing entries that are missing altogether from the new array.
   */
  mergeArraysSmart: <T>(
    originalValues: T[],
    newValues: T[],
    generateKey: (value: T) => string
  ): T[] => {
    var results: T[] = [];
    var originalValuesMap = buildKeyedMap(originalValues, generateKey);

    newValues.forEach((newValue) => {
      const key = generateKey(newValue);
      if (originalValuesMap.has(key)) {
        var originalValue = originalValuesMap.get(key) as T;
        results.push(internals.mergeValueSimple(originalValue, newValue));
      } else {
        results.push(cloneViaSerialization(newValue));
      }
    });

    return results;
  },

  nodeKey: (node: SerializedNode) => node.id,
  linkKey: (link: SerializedLink) => JSON.stringify([link.source, link.target]),

  mergeSerializedDocuments: (
    originalDoc: SerializedGraphDocument,
    newDoc: SerializedGraphDocument
  ): SerializedGraphDocument => {
    const mergeValueField = <K extends keyof SerializedGraphDocument>(key: K): SerializedGraphDocument[K] => {
      return internals.mergeValueSimple(originalDoc[key], newDoc[key]);
    };

    return {
      nodes:
        internals.mergeArraysSmart(
          originalDoc.nodes || [],
          newDoc.nodes || [],
          internals.nodeKey
        ),
      links:
        internals.mergeArraysSmart(
          originalDoc.links || [],
          newDoc.links || [],
          internals.linkKey
        ),
      zoomState: mergeValueField("zoomState"),
      layoutState: mergeValueField("layoutState"),
      displayConfig: mergeValueField("displayConfig")
    };
  }
};

export class GraphDocument {
  name: string = "Untitled";
  nodes: MyNodeDatum[] = [];
  links: MyLinkDatum[] = [];
  zoomState: ZoomState = zoomStateDeserializer.defaultValueFactory();
  layoutState: LayoutState = layoutStateDeserializer.defaultValueFactory();
  displayConfig: DisplayConfig = displayConfigDeserializer.defaultValueFactory();

  static empty() {
    return this.load("{}");
  }

  static load(jsonData: string, name?: string) {
    var data = JSON.parse(jsonData) as SerializedGraphDocument;
    return this.loadSGD(data, name);
  }

  static loadSGD(data: SerializedGraphDocument, name?: string) {
    var serializedNodes = data.nodes || [];
    var serializedLinks = data.links || [];

    var nodeMap = new Map<String, MyNodeDatum>();

    var document = new GraphDocument();
    document.nodes = serializedNodes.map((sn: SerializedNode) => {
      var node = nodeDeserializer.deserialize(sn);

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
    document.displayConfig = displayConfigDeserializer.deserialize(data.displayConfig);
    if (name !== undefined) {
      document.name = name;
    }

    return document;
  }

  private constructor() {}

  clone(): GraphDocument {
    return GraphDocument.load(this.save(), this.name);
  }

  merge(serializedOtherDocument: SerializedGraphDocument): GraphDocument {
    const serializedMergedDocument =
      internals.mergeSerializedDocuments(this.saveSGD(), serializedOtherDocument);
    return GraphDocument.loadSGD(serializedMergedDocument, this.name);
  }

  private saveSGD(): SerializedGraphDocument {
    return {
      nodes: this.nodes.map(this.serializeNode),
      links: this.links.map(this.serializeLink),
      zoomState: this.zoomState,
      layoutState: this.layoutState,
      displayConfig: this.displayConfig
    };
  }

  save(): string {
    return JSON.stringify(this.saveSGD(), null, 2);
  }

  private serializeNode = (node: MyNodeDatum): SerializedNode => {
    return removeNullsAndUndefineds({
      id: node.id,
      label: node.label,
      isLocked: node.isLocked,
      color: node.color,
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

function cloneViaSerialization<T>(object: T): T {
  if (!(object instanceof Object)) {
    return object;
  }
  return JSON.parse(JSON.stringify(object));
}

function isArrayOrPrimitive<T>(object: T): boolean {
  return (object instanceof Array || !(object instanceof Object));
}

function buildKeyedMap<T>(values: T[], generateKey: (value: T) => string): Map<string, T> {
  var map = new Map<string, T>();
  values.forEach((value) => {
    var key = generateKey(value);
    if (map.get(key) !== undefined) {
      throw new Error("duplicate key generated from array: " + key);
    }
    map.set(key, value);
  });
  return map;
}
