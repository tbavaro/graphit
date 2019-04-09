import * as Defaults from "./Defaults";

interface OptionalNumber {
  aNumber?: number
}

it("works with simple optional field", () => {
  expect(
    Defaults.applyDefaults<OptionalNumber>(
      {},
      { aNumber: 100 }
    )
  ).toEqual({ aNumber: 100 });

  expect(
    Defaults.applyDefaults<OptionalNumber>(
      { aNumber: 1 },
      { aNumber: 100 }
    )
  ).toEqual({ aNumber: 1 });
});

interface OptionalNumberAndRequiredString {
  aNumber?: number,
  aString: string
}

it("works with mixed optional and required fields", () => {
  expect(
    Defaults.applyDefaults<OptionalNumberAndRequiredString>(
      { aString: "foo" },
      { aNumber: 100, aString: "bar" }
    )
  ).toEqual({ aNumber: 100, aString: "foo" });

  expect(
    Defaults.applyDefaults<OptionalNumberAndRequiredString>(
      { aNumber: 1, aString: "foo" },
      { aNumber: 100, aString: "bar" }
    )
  ).toEqual({ aNumber: 1, aString: "foo" });
});

interface ArrayOfOptionalNumbers {
  items?: OptionalNumber[],
}

it("provides empty array for unspecified arrays", () => {
  expect(
    Defaults.applyDefaults<ArrayOfOptionalNumbers>(
      { },
      { items: [ { aNumber: 100 } ] }
    )
  ).toEqual({ items: [] });
});

it("provides empty array for empty arrays", () => {
  expect(
    Defaults.applyDefaults<ArrayOfOptionalNumbers>(
      { items: [] },
      { items: [ { aNumber: 100 } ] }
    )
  ).toEqual({ items: [] });
});

it("fills in defaults for array entries", () => {
  expect(
    Defaults.applyDefaults<ArrayOfOptionalNumbers>(
      { items: [ {} ] },
      { items: [ { aNumber: 100 } ] }
    )
  ).toEqual({ items: [ { aNumber: 100 } ] });

  expect(
    Defaults.applyDefaults<ArrayOfOptionalNumbers>(
      { items: [ {}, {} ] },
      { items: [ { aNumber: 100 } ] }
    )
  ).toEqual({ items: [ { aNumber: 100 }, { aNumber: 100 } ] });

  expect(
    Defaults.applyDefaults<ArrayOfOptionalNumbers>(
      { items: [ {}, { aNumber: 2 } ] },
      { items: [ { aNumber: 100 } ] }
    )
  ).toEqual({ items: [ { aNumber: 100 }, { aNumber: 2 } ] });
});

interface NullableValue {
  value?: number | null;
}

it("null works as a default value", () => {
  expect(
    Defaults.applyDefaults<NullableValue>(
      {},
      { value: null }
    )
  ).toEqual({ value: null });
});

it("null works as a real value", () => {
  expect(
    Defaults.applyDefaults<NullableValue>(
      { value: null },
      { value: 3 }
    )
  ).toEqual({ value: null });
});
