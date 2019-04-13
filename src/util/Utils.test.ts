import { forSome, iterableForEach } from "./Utils";

function double(value: number) {
  return value * 2;
}

function testIterableForEach(
  name: string,
  values: Iterable<number>,
  expectedOutput: number[]
) {
  it(`iterableForEach: ${name}`, () => {
    const result: number[] = [];
    iterableForEach(values, value => result.push(double(value)));
    expect(result).toEqual(expectedOutput);
  });
}

testIterableForEach("empty array", [], []);
testIterableForEach("basic array", [1, 2, 3], [2, 4, 6]);
testIterableForEach("empty set", new Set(), []);
testIterableForEach("basic set", new Set([1, 2, 3]), [2, 4, 6]);

function testForSome(
  name: string,
  values: string[],
  indexes: Iterable<number> | undefined,
  expectedOutput: string[]
) {
  it(`forSome: ${name}`, () => {
    const result: string[] = [];
    forSome(values, value => result.push(value), indexes);
    expect(result).toEqual(expectedOutput);
  });
}

testForSome("empty", [], [], []);
testForSome("empty indexes", ["a", "b", "c"], [], []);
testForSome("unspecified indexes", ["a", "b", "c"], undefined, ["a", "b", "c"]);
testForSome("basic indexes", ["a", "b", "c"], [0, 2], ["a", "c"]);
testForSome("repeated indexes", ["a", "b", "c"], [0, 2, 0], ["a", "c", "a"]);
it("forSome: index out of bounds", () => {
  expect(() => forSome(["a"], () => { /* */ }, [0, 1])).toThrow();
});
