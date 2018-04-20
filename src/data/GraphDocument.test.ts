import {
  GraphDocument,
  internals
} from "./GraphDocument";
import {
  DEFAULT_LAYOUT_TYPE,
  DEFAULT_PARTICLE_CHARGE,
} from "./GraphData";

const mergeValueSimple = internals.mergeValueSimple;

it("test empty", () => {
  var document = GraphDocument.empty();
  expect(document.name).toEqual("Untitled");
  expect(document.nodes.length).toEqual(0);
  expect(document.links.length).toEqual(0);
  expect(document.data.layoutState.layoutType).toEqual(DEFAULT_LAYOUT_TYPE);
  expect(document.data.layoutState.forceSimulationConfig.particleCharge).toEqual(DEFAULT_PARTICLE_CHARGE);
});

it("test load basic data only", () => {
  var documentJSON = JSON.stringify({
    nodes: [
      {
        id: "a",
        label: "node a"
      },
      {
        id: "b",
        label: "node b"
      },
      {
        id: "c",
        label: "node c"
      }
    ],
    links: [
      {
        source: "a",
        target: "b"
      }
    ]
  });

  var document = GraphDocument.load(documentJSON);

  // nodes
  expect(document.nodes.length).toEqual(3);
  expect(document.nodes[0].id).toEqual("a");
  expect(document.nodes[2].label).toEqual("node c");

  // links
  expect(document.links.length).toEqual(1);
  expect(document.links[0].source).toEqual(document.nodes[0]);
  expect(document.links[0].target).toEqual(document.nodes[1]);

  // defaults for non-specified fields
  expect(document.name).toEqual("Untitled");
  expect(document.data.layoutState.layoutType).toEqual(DEFAULT_LAYOUT_TYPE);
});

it("test load name", () => {
  var document = GraphDocument.load("{}", "my name");
  expect(document.name).toEqual("my name");
});

it("test load full data", () => {
  var documentJSON = JSON.stringify({
    nodes: [],
    links: [],
    layoutState: {
      layoutType: DEFAULT_LAYOUT_TYPE
    }
  });

  var document = GraphDocument.load(documentJSON);

  expect(document.name).toEqual("Untitled");
  expect(document.data.layoutState.layoutType).toEqual(DEFAULT_LAYOUT_TYPE);
});

it("test clone", () => {
  var documentJSON = JSON.stringify({
    nodes: [
      {
        id: "a",
        label: "node a"
      },
      {
        id: "b",
        label: "node b"
      },
      {
        id: "c",
        label: "node c"
      }
    ],
    links: [
      {
        source: "a",
        target: "b"
      }
    ]
  });

  var document = GraphDocument.load(documentJSON, "named doc");
  var clone = document.clone();

  expect(document.name).toEqual(clone.name);
  expect(document.nodes.length).toEqual(clone.nodes.length);
  expect(document.links.length).toEqual(clone.links.length);

  // make sure it's a deep copy
  expect(document.nodes[0]).not.toBe(clone.nodes[0]);
  expect(document.links[0]).not.toBe(clone.links[0]);
  expect(clone.links[0].source).toBe(clone.nodes[0]);
  expect(clone.links[0].source).not.toBe(document.nodes[0]);
  expect(clone.links[0].target).toBe(clone.nodes[1]);
});

it("test mergeValueSimple", () => {
  // primitive + primitive
  expect(mergeValueSimple(null, null)).toBe(null);
  expect(mergeValueSimple(null as (string | null), "foo")).toBe("foo");
  expect(mergeValueSimple("foo" as (string | null), null)).toBe(null);
  expect(mergeValueSimple("foo" as (string | undefined), undefined)).toBe("foo");
  expect(mergeValueSimple("foo" as string, "")).toBe("");

  // array + array
  expect(mergeValueSimple([], [])).toEqual([]);
  expect(mergeValueSimple([1, 2, 3], [])).toEqual([]);
  expect(mergeValueSimple([1, 2, 3], [4, 5, 6])).toEqual([4, 5, 6]);
  expect(mergeValueSimple([] as number[], [4, 5, 6])).toEqual([4, 5, 6]);

  // object + object
  expect(mergeValueSimple({}, {})).toEqual({});
  expect(mergeValueSimple({ a: 1 }, {})).toEqual({ a: 1 });
  expect(mergeValueSimple({ a: 1 }, { a: 2 })).toEqual({ a: 2 });
  expect(mergeValueSimple({ a: 1 } as any, { b: 2 })).toEqual({ a: 1, b: 2 });
  expect(mergeValueSimple({ a: 1, b: 2 }, { a: undefined })).toEqual({ a: 1, b: 2 });
  expect(mergeValueSimple({ a: 1, b: 2 }, { a: null })).toEqual({ a: null, b: 2 });
  expect(mergeValueSimple({ a: { foo: 1, bar: 2 } }, { a: { foo: 3 } })).toEqual({ a: { foo: 3, bar: 2 } });

  // object + undefined
  expect(mergeValueSimple({ a: 1 }, undefined)).toEqual({ a: 1 });

  // object + primitive / primitive + object
  expect(mergeValueSimple({ a: 1 } as any, "foo")).toEqual("foo");
  expect(mergeValueSimple("foo" as any, { a: 1 })).toEqual({ a: 1 });
});

type ArrayMergeTestObject1 = {
  k: string;
  v1?: number;
  v2?: number;
};

function amtoKey<T extends { k: string }>(value: T) {
  return value.k;
}

type ArrayMergeTestObject2 = {
  k: string;
  v?: {
    a?: number,
    b?: number
  };
};

function testMergeArraysSmartFuncFactory<T>(keyFunc: (value: T) => string) {
  return (oldArray: T[], newArray: T[]) => {
    return expect(internals.mergeArraysSmart(oldArray, newArray, keyFunc));
  };
}

it("test mergeArraysSmart with simple key", () => {
  const test = testMergeArraysSmartFuncFactory<ArrayMergeTestObject1>(amtoKey);
  test([], []).toEqual([]);
  test([ { k: "foo", v1: 1, v2: 2 }], []).toEqual([]);
  test([], [ { k: "foo", v1: 1, v2: 2 }]).toEqual([ { k: "foo", v1: 1, v2: 2 } ]);
  test(
    [ { k: "foo", v1: 1, v2: 2 } ],
    [ { k: "foo" } ]
  ).toEqual([ { k: "foo", v1: 1, v2: 2 } ]);
  test(
    [ { k: "foo", v1: 1, v2: 2 }],
    [ { k: "foo", v1: 3 } ]
  ).toEqual([ { k: "foo", v1: 3, v2: 2 } ]);
  test(
    [ { k: "foo", v1: 1, v2: 2 }],
    [ { k: "foo", v1: 3 } ]
  ).toEqual([ { k: "foo", v1: 3, v2: 2 } ]);
  test(
    [ { k: "foo", v1: 1, v2: 2 }],
    [
      { k: "foo", v1: 3 },
      { k: "bar", v2: 4 }
    ]
  ).toEqual([
    { k: "foo", v1: 3, v2: 2 },
    { k: "bar", v2: 4 }
  ]);

  // test deep merge
  const test2 = testMergeArraysSmartFuncFactory<ArrayMergeTestObject2>(amtoKey);
  test2(
    [ { k: "foo", v: {} } ],
    [ { k: "foo" } ]
  ).toEqual([
    { k: "foo", v: {} }
  ]);
  test2(
    [ { k: "foo", v: { a: 1, b: 2 } } ],
    [ { k: "foo" } ]
  ).toEqual([
    { k: "foo", v: { a: 1, b: 2 } }
  ]);
  test2(
    [ { k: "foo", v: { a: 1, b: 2 } } ],
    [ { k: "foo", v: { a: 3 } } ]
  ).toEqual([
    { k: "foo", v: { a: 3, b: 2 } }
  ]);
});
