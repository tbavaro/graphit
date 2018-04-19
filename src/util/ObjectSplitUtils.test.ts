import { splitObject, splitObjects } from "./ObjectSplitUtils";

it("splitObject: empty", () => {
  expect(splitObject(
    {},
    [],
    "other"
  )).toEqual({
    other: {}
  });
});

it("splitObject: no top level", () => {
  expect(splitObject(
    {
      "a": 1,
      "b": 2
    },
    [],
    "other"
  )).toEqual({
    other: {
      "a": 1,
      "b": 2
    }
  });
});

it("splitObject: some top level properties", () => {
  expect(splitObject(
    {
      "a": 1,
      "b": 2
    },
    [
      "a"
    ],
    "other"
  )).toEqual({
    "a": 1,
    other: {
      "b": 2
    }
  });
});

it("splitObject: default top level property", () => {
  expect(splitObject(
    {},
    [
      "a"
    ],
    "other",
    {
      "a": 3
    }
  )).toEqual({
    "a": 3,
    other: {}
  });
});

it("splitObject: overridden default top level property", () => {
  expect(splitObject(
    {
      "a": 1
    },
    [
      "a"
    ],
    "other",
    {
      "a": 3
    }
  )).toEqual({
    "a": 1,
    other: {}
  });
});

it("splitObject: default other values property", () => {
  expect(splitObject(
    {},
    [],
    "other",
    {},
    {
      "a": 3
    }
  )).toEqual({
    other: {
      "a": 3
    }
  });
});

it("splitObject: overridden default other values property", () => {
  expect(splitObject(
    {
      "a": 1
    },
    [],
    "other",
    {},
    {
      "a": 3
    }
  )).toEqual({
    other: {
      "a": 1
    }
  });
});

it("splitObject: don't allow default values to contain other values property", () => {
  expect(() => {
    splitObject(
      {},
      [],
      "other",
      {
        "other": {}
      } as any
    );
  }).toThrow();
});

////////////////////////////////////////

it("splitObjects: empty", () => {
  expect(splitObjects(
    [],
    [],
    "other"
  )).toEqual([]);
});

it("splitObjects: nontrivial", () => {
  expect(splitObjects(
    [
      {
        "a": 1,
        "b": 2,
        "c": 3
      },
      {
        "b": 2,
        "d": 4,
        "e": 5
      }
    ],
    [ "a", "b", "d" ],
    "other",
    {
      "a": 11,
      "b": 12,
      "d": 14
    } as any,
    {
      "e": 15
    }
  )).toEqual([
    {
      "a": 1,
      "b": 2,
      "d": 14,
      "other": {
        "c": 3,
        "e": 15
      }
    },
    {
      "a": 11,
      "b": 2,
      "d": 4,
      "other": {
        "e": 5
      }
    }
  ]);
});
