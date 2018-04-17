import { tabularDataToPOJOs, pojosToTabularData } from "./TabularDataUtils";

function testTabularDataToPOJOs<T>(
  input: {
    headers: string[], data: Array<T | undefined>[]
  },
  expected: { [key: string]: T }[],
  name?: string
) {
  name = ("tabularDataToPOJOs: " + (name || JSON.stringify(input)));
  it(name, () => {
    expect(tabularDataToPOJOs(input.headers, input.data)).toEqual(expected);
  });
}

testTabularDataToPOJOs(
  {
    headers: [],
    data: []
  },
  [],
  "empty"
);

testTabularDataToPOJOs(
  {
    headers: [ "a" ],
    data: []
  },
  [],
  "headers but no data"
);

testTabularDataToPOJOs(
  {
    headers: [],
    data: [ [ "1a" ] ]
  },
  [
    {}
  ],
  "data but no headers"
);

testTabularDataToPOJOs(
  {
    headers: [ "a", "b" ],
    data: [
      [ "1a" , "1b" ],
      [ "2a" , "2b" ]
    ]
  },
  [
    { "a": "1a", "b": "1b" },
    { "a": "2a", "b": "2b" }
  ],
  "straightforward"
);

testTabularDataToPOJOs(
  {
    headers: [ "a", "b" ],
    data: [
      [ "1a" , "1b" ],
      [ "2a" ],
      [ undefined, "3b" ]
    ]
  },
  [
    { "a": "1a", "b": "1b" },
    { "a": "2a" },
    { "b": "3b" }
  ],
  "ragged"
);

testTabularDataToPOJOs(
  {
    headers: [ "a" ],
    data: [
      [ "1a" , "1b" ]
    ]
  },
  [
    { "a": "1a" }
  ],
  "extra row data"
);

testTabularDataToPOJOs(
  {
    headers: [ "a", "b" ],
    data: [
      [ "1a" ]
    ]
  },
  [
    { "a": "1a" }
  ],
  "extra headers"
);

testTabularDataToPOJOs(
  {
    headers: [ "a" ],
    data: [
      [],
      [ "2a" ]
    ]
  },
  [
    {},
    { "a": "2a" }
  ],
  "empty row"
);

testTabularDataToPOJOs<string | null>(
  {
    headers: [ "a" ],
    data: [
      [ "1a" ],
      [ "" ],
      [ null ],
      []
    ]
  },
  [
    { "a": "1a" },
    { "a": "" },
    { "a": null },
    {}
  ],
  "nulls and empties are kept"
);

testTabularDataToPOJOs<any>(
  {
    headers: [ "a" ],
    data: [
      [ 0 ],
      [ false ],
      [ { "foo": 1 } ]
    ]
  },
  [
    { "a": 0 },
    { "a": false },
    { "a": { "foo": 1 } }
  ],
  "works with non-string types"
);

////////////////////////////////////

function testPOJOsToTabularData<T>(
  input: { [key: string]: T }[],
  expected: {
    headers: string[],
    rows: Array<T | undefined>[]
  },
  name?: string
) {
  name = ("pojosToTabularData: " + (name || JSON.stringify(input)));
  it(name, () => {
    expect(pojosToTabularData(input)).toEqual(expected);
  });
}

testPOJOsToTabularData(
  [],
  {
    headers: [],
    rows: []
  },
  "empty"
);

testPOJOsToTabularData(
  [
    {}
  ],
  {
    headers: [],
    rows: [
      []
    ]
  },
  "empty object"
);

testPOJOsToTabularData(
  [
    {
      "a": "a1",
      "b": "b1"
    }
  ],
  {
    headers: [
      "a", "b"
    ],
    rows: [
      [
        "a1",
        "b1"
      ]
    ]
  },
  "simple object"
);

testPOJOsToTabularData(
  [
    {
      "a": "a1"
    },
    {
      "b": "b2"
    }
  ],
  {
    headers: [
      "a", "b"
    ],
    rows: [
      [
        "a1"
      ],
      [
        undefined,
        "b2"
      ]
    ]
  },
  "totally sparse"
);

testPOJOsToTabularData(
  [
    {
      "a": "a1"
    },
    {
      "b": "b2",
      "a": "a2"
    }
  ],
  {
    headers: [
      "a", "b"
    ],
    rows: [
      [
        "a1"
      ],
      [
        "a2",
        "b2"
      ]
    ]
  },
  "sparse with repeats"
);
