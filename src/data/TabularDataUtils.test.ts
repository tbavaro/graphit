import { tabularDataToPOJOs } from "./TabularDataUtils";

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
