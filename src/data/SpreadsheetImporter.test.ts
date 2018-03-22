import { internals } from "./SpreadsheetImporter";

it("test empty spreadsheet", () => {
  const result = internals.createSGDFromDataColumns({
    nodeIds: [],
    nodeLabels: [],
    linkSourceIds: [],
    linkTargetIds: []
  });
  expect(result).toMatchObject({
    nodes: [],
    links: []
  });
});

it("test simple spreadsheet", () => {
  const result = internals.createSGDFromDataColumns({
    nodeIds: [ "a", "b", "c" ],
    nodeLabels: [ "node a", "node b", "node c" ],
    linkSourceIds: [ "a", "b" ],
    linkTargetIds: [ "b", "c" ]
  });
  expect(result).toMatchObject({
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
      },
      {
        source: "b",
        target: "c"
      }
    ]
  });
});

function transpose(input: any[][]): any[][] {
  if (input.length === 0) {
    return [];
  }
  var output = input[0].map((_, column) => input.map((__, row) => {
    if (input.length <= row || input[row].length <= column) {
      return undefined;
    } else {
      return input[row][column];
    }
  }));
  // trim extra undefineds in each output column
  return output.map((column) => {
    while (column.length > 0 && column[column.length - 1] === undefined) {
      column = column.slice(0, column.length - 1);
    }
    return column;
  });
}

it("test transpose helper", () => {
  expect(transpose([])).toMatchObject([]);
  expect(transpose([
    [ "x" ]
  ])).toMatchObject([
    [ "x" ]
  ]);
  expect(transpose([
    [ undefined ]
  ])).toMatchObject([
    [ ]
  ]);
  expect(transpose([
    [ "x", undefined ]
  ])).toMatchObject([
    [ "x" ],
    [ ]
  ]);
  expect(transpose([
    [ "A",  "B",  "C"  ],
    [ "a1", "b1", "c1" ]
  ])).toMatchObject([
    [ "A", "a1" ],
    [ "B", "b1" ],
    [ "C", "c1" ]
  ]);
  expect(transpose([
    [ "A",  "B",  "C"  ],
    [ "a1", "b1" ]
  ])).toMatchObject([
    [ "A", "a1" ],
    [ "B", "b1" ],
    [ "C" ]
  ]);
  expect(transpose([
    [ "A",  "B",  "C"  ],
    [ "a1", undefined, "c1" ]
  ])).toMatchObject([
    [ "A", "a1" ],
    [ "B" ],
    [ "C", "c1" ]
  ]);
});

it("test extractNamedColumnsToStringArrays", () => {
  var wrapped = (data, columnNames) => {
    return internals.extractNamedColumnsToStringArrays(transpose(data), columnNames);
  };

  // empty
  expect(wrapped([], [])).toMatchObject([]);

  // others
  expect(wrapped(
    [
      [ "A",  "B"  ],
      [ "a1", "b1" ],
      [ "a2", "b2" ]
    ],
    [
      "A"
    ]
  )).toMatchObject([
    [ "a1", "a2" ]
  ]);
  expect(wrapped(
    [
      [ "A",  "B"  ],
      [ "a1", "b1" ],
      [ "a2", "b2" ]
    ],
    [
      "A", "B"
    ]
  )).toMatchObject([
    [ "a1", "a2" ],
    [ "b1", "b2" ]
  ]);
  expect(wrapped(
    [
      [ "A",  "B"  ],
      [ "a1", "b1" ],
      [ "a2", "b2" ]
    ],
    [
      "B", "A"
    ]
  )).toMatchObject([
    [ "b1", "b2" ],
    [ "a1", "a2" ]
  ]);

  // stringifying
  expect(wrapped(
    [
      [ "A"  ],
      [ "a1" ],
      [ 2    ]
    ],
    [
      "A"
    ]
  )).toMatchObject([
    [ "a1", "2" ]
  ]);
});

it("test looksLikeHtml", () => {
  expect(internals.looksLikeHtml("")).toBe(false);
  expect(internals.looksLikeHtml("hello")).toBe(false);
  expect(internals.looksLikeHtml("3 < 4")).toBe(false);
  expect(internals.looksLikeHtml("3 < 4 / 5 > 6")).toBe(false);
  expect(internals.looksLikeHtml("click <a>here</a>")).toBe(true);
  expect(internals.looksLikeHtml("click <a>here</ a>")).toBe(true);
  expect(internals.looksLikeHtml("two<br/>lines")).toBe(true);
});
