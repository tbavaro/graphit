import * as GraphData from "./GraphData";
import { MyLinkDatum, MyNodeDatum } from './MyNodeDatum';

// TODO move merge logic out of here, now that the data is separated
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

  nodeKey: (node: GraphData.SerializedNodeV1) => node.id,
  linkKey: (link: GraphData.SerializedLinkV1) => JSON.stringify([link.source, link.target]),

  mergeSerializedDocuments: (
    originalDoc: GraphData.Document,
    newDoc: GraphData.SerializedDocument
  ): GraphData.Document => {
    const mergeValueField = <K extends keyof GraphData.SerializedDocument>(key: K): GraphData.SerializedDocument[K] => {
      return internals.mergeValueSimple(originalDoc[key], newDoc[key]);
    };

    return GraphData.applyDefaults({
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
    });
  }
};

function assertDefined<T>(value: T | undefined): T {
  if (value === undefined) {
    throw new Error("unexpected undefined");
  }
  return value;
}

export class GraphDocument {
  name: string;
  readonly nodes: MyNodeDatum[];
  readonly links: MyLinkDatum[];
  private data: GraphData.Document;
  get layoutState() {
    return this.data.layoutState;
  }
  get zoomState() {
    return this.data.zoomState;
  }
  get displayConfig() {
    return this.data.displayConfig;
  }

  static empty() {
    return this.load("{}");
  }

  static load(jsonData: string, name?: string) {
    var data = GraphData.load(JSON.parse(jsonData));
    return new GraphDocument({
      name: name || "Untitled",
      data: data
    });
  }

  public constructor(
    attrs: {
      name: string,
      data: GraphData.Document
    }
  ) {
    this.name = attrs.name;
    this.data = attrs.data;

    const idToNodeMap = new Map<string, MyNodeDatum>();
    this.nodes = this.data.nodes.map(sn => {
      const node: MyNodeDatum = {
        id: sn.id,
        label: sn.label,
        isLocked: sn.isLocked,
        color: sn.color,
        x: (sn.x === null ? undefined : sn.x),
        y: (sn.y === null ? undefined : sn.y)
      };
      if (node.isLocked) {
        node.fx = node.x;
        node.fy = node.y;
      }
      idToNodeMap.set(node.id, node);
      return node;
    });
    this.links = this.data.links.map(sl => ({
      source: assertDefined(idToNodeMap.get(sl.source)),
      target: assertDefined(idToNodeMap.get(sl.target))
    }));
  }

  private copyDataFromSimulation() {
    this.nodes.forEach((node, i) => {
      const sn = this.data.nodes[i];
      if (node.id !== sn.id) {
        throw new Error("ids don't match");
      }
      sn.isLocked = node.isLocked;
      sn.x = (node.x === undefined ? null : node.x);
      sn.y = (node.y === undefined ? null : node.y);
    });
    this.links.forEach((link, i) => {
      const sl = this.data.links[i];
      sl.source = link.source.id;
      sl.target = link.target.id;
    });
  }

  clone(): GraphDocument {
    return GraphDocument.load(this.save(), this.name);
  }

  merge(serializedOtherDocument: GraphData.SerializedDocument): GraphDocument {
    const serializedMergedDocument =
      internals.mergeSerializedDocuments(this.saveSGD(), serializedOtherDocument);
    return new GraphDocument({
      name: this.name,
      data: serializedMergedDocument
    });
  }

  private saveSGD(): GraphData.Document {
    this.copyDataFromSimulation();
    return this.data;
  }

  save(): string {
    return JSON.stringify(this.saveSGD(), null, 2);
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
