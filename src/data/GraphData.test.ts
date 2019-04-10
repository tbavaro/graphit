import * as GraphData from "./GraphData";

it("load: empty gives default document", () => {
  expect(GraphData.load({})).toEqual(GraphData.createDefaultDocument());
});

it("load: empty version 1 gives default document", () => {
  expect(GraphData.load({ version: 1 })).toEqual(GraphData.createDefaultDocument());
});

it("load: empty latest version gives default document", () => {
  expect(GraphData.load({ version: GraphData.LATEST_VERSION })).toEqual(GraphData.createDefaultDocument());
});

it("load: empty version 0 throws error", () => {
  expect(() => GraphData.load({ version: 0 })).toThrow();
});

it("load: unspecified version with basic data", () => {
  const input = {
    nodes: [
      {
        id: "0",
        label: "zero"
      },
      {
        id: "1",
        label: "one"
      }
    ],
    links: [
      {
        source: "0",
        target: "1"
      }
    ]
  };

  const document = GraphData.load(input);

  expect(document.version).toBe(GraphData.LATEST_VERSION);

  // nodes values passed in
  expect(document.nodes.length).toBe(2);
  expect(document.nodes.map(n => n.id)).toEqual(["0", "1"]);
  expect(document.nodes.map(n => n.label)).toEqual(["zero", "one"]);

  // also nodes should get default values
  expect(document.nodes.map(n => n.isLocked)).toEqual([false, false]);

  // links values passed in
  expect(document.links.length).toBe(1);
  expect(document.links.map(l => l.source)).toEqual(["0"]);
  expect(document.links.map(l => l.target)).toEqual(["1"]);

  // spot-check some other default values
  expect(document.zoomState.scale).toBe(1);
});
