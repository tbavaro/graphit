import { MyNodeDatum } from "../data/MyNodeDatum";
import { NodeSearchHelper } from "./SearchUtils";

function testNodeSearch(attrs: {
  name: string;
  query: string;
  labels: string[];
  expectedResults: string[];
  enforceOrdering?: boolean;
}) {
  it(`NodeSearchHelper: ${attrs.name}`, () => {
    const nodes = attrs.labels.map((label: string): MyNodeDatum => ({
      id: label,
      label: label,
      isLocked: false
    }));

    const helper = new NodeSearchHelper(nodes);
    const results = helper.search(attrs.query).map(node => node.label);

    const maybeSortedExpectedResults = [...attrs.expectedResults];
    if (!attrs.enforceOrdering) {
      results.sort();
      maybeSortedExpectedResults.sort();
    }

    expect(results).toEqual(maybeSortedExpectedResults);
  });
}

function testNodeSearchMulti(tests: Array<Parameters<(typeof testNodeSearch)>[0]>) {
  tests.forEach(testNodeSearch);
}

testNodeSearchMulti([
  {
    name: "empty input set",
    query: "foo",
    labels: [],
    expectedResults: []
  },
  {
    name: "single exact match",
    query: "foo",
    labels: ["foo"],
    expectedResults: ["foo"]
  },
  {
    name: "single inner word match",
    query: "foo",
    labels: ["this has foo in it"],
    expectedResults: ["this has foo in it"]
  },
  {
    name: "single partial match",
    query: "foo",
    labels: ["food"],
    expectedResults: ["food"]
  },
  {
    name: "single near match",
    query: "fou",
    labels: ["foo"],
    expectedResults: ["foo"]
  },
  {
    name: "single non-match",
    query: "bar",
    labels: ["foo"],
    expectedResults: []
  },
  {
    name: "match, near match, non-match",
    query: "foo",
    labels: ["fou", "bar", "foo"],
    expectedResults: ["foo", "fou"],
    enforceOrdering: true
  },
  {
    name: "single multi-word exact match",
    query: "hello there",
    labels: ["hello there"],
    expectedResults: ["hello there"]
  },
  {
    name: "order multi-word separated near match and almost-near match",
    query: "hello there",
    labels: ["oh hello to you", "oh hello to you there"],
    expectedResults: ["oh hello to you there", "oh hello to you"],
    enforceOrdering: true
  },
  {
    name: "order multi-word separated near match and reverse match",
    query: "hello there",
    labels: ["hey there, hello!", "oh hello to you there"],
    expectedResults: ["oh hello to you there", "hey there, hello!"],
    enforceOrdering: true
  },
  {
    name: "order multi-word overlap match vs separate match",
    query: "howdy how",
    labels: ["howdy", "howdy there how are you"],
    expectedResults: ["howdy there how are you", "howdy"],
    enforceOrdering: true
  },
  {
    name: "order exact match vs exact match with additional words",
    query: "howdy",
    labels: ["howdy there how are you", "howdy"],
    expectedResults: ["howdy", "howdy there how are you"],
    enforceOrdering: true
  },
]);
