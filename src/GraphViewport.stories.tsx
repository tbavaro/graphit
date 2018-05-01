import { storiesOf } from "@storybook/react";

import * as helpers from "./helpers.stories";
import * as GraphViewport from "./GraphViewport";
import { GraphDocument } from "./data/GraphDocument";
import * as GraphData from "./data/GraphData";

function propsForDocument(document: GraphDocument) {
  return {
    nodes: document.nodes,
    links: document.links,
    zoomState: document.zoomState,
    nodeRenderMode: document.displayConfig.nodeRenderMode
  };
}

const addVariationRaw = helpers.createVariations({
  storyGroup: storiesOf("GraphViewport", module),
  componentClass: GraphViewport.Component,
  defaultProps: () => propsForDocument(GraphDocument.empty()),
  showCorners: false,
  fill: true
});

function addVariation(name: string, data: GraphData.SerializedDocument) {
  const document = new GraphDocument({
    name: `testdoc:${name}`,
    data: GraphData.load(data)
  });
  addVariationRaw(name, propsForDocument(document));
}

type PartialNodeWithoutId = Partial<GraphData.SerializedNode> & { id?: never };

function easyNodes(
  input: { [id: string]: PartialNodeWithoutId },
  overrides?: PartialNodeWithoutId
): GraphData.SerializedNode[] {
  const output: GraphData.SerializedNode[] = [];
  for (const id of Object.keys(input)) {
    const node = input[id] as any;
    node.id = id;

    // apply overrides
    if (overrides) {
      for (const oKey of Object.keys(overrides)) {
        if (node[oKey] === undefined) {
          node[oKey] = overrides[oKey];
        }
      }
    }

    // set the label if it's not set
    if (node.label === undefined) {
      node.label = node.id;
    }

    output.push(node);
  }
  return output;
}

// basic
addVariation("empty", {});
addVariation("single node", {
  nodes: easyNodes({
    "node": { x: 0, y: 0 }
  })
});
addVariation("triangle", {
  nodes: easyNodes(
    {
      "A": { x: 0, y: -100 },
      "B": { x: 100, y: 100 },
      "C": { x: -100, y: 100 }
    },
    {
      isLocked: true
    }
  ),
  links: [
    { source: "A", target: "B" },
    { source: "B", target: "C" },
    { source: "C", target: "A" }
  ]
});
