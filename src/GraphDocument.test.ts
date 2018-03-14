import {
  GraphDocument,
  DEFAULT_LAYOUT_TYPE,
  DEFAULT_PARTICLE_CHARGE
} from "./GraphDocument";

it("test empty", () => {
  var document = GraphDocument.empty();
  expect(document.name).toEqual("Untitled");
  expect(document.nodes.length).toEqual(0);
  expect(document.links.length).toEqual(0);
  expect(document.layoutState.layoutType).toEqual(DEFAULT_LAYOUT_TYPE);
  expect(document.layoutState.forceSimulationConfig.particleCharge).toEqual(DEFAULT_PARTICLE_CHARGE);
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
  expect(document.layoutState.layoutType).toEqual(DEFAULT_LAYOUT_TYPE);
});
