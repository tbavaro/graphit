import {
  SimpleDeserializer,
  SimplePartialDeserializer
} from "./Deserializers";

interface Foo {
  a: number;
  b: Bar;
}

interface Bar {
  x: string;
  y: number;
}

const barDeserializer = new SimplePartialDeserializer<Bar>(() => {
  return {
    x: "default x",
    y: 456
  };
});

const fooDeserializer = new SimplePartialDeserializer<Foo>(
  () => {
    return {
      a: 123,
      b: barDeserializer.defaultValueFactory()
    };
  },
  {
    b: barDeserializer
  }
);

it("test undefined", () => {
  var result = fooDeserializer.deserialize(undefined);

  expect(result.a).toBe(123);
  expect(result.b.x).toBe("default x");
});

it("test empty object overrides", () => {
  var result = fooDeserializer.deserialize({});

  expect(result.a).toBe(123);
  expect(result.b.x).toBe("default x");
});

it("test first level override only", () => {
  var result = fooDeserializer.deserialize({
    a: 1
  });

  expect(result.a).toBe(1);
  expect(result.b.x).toBe("default x");
});

it("test second level overrides", () => {
  var result = fooDeserializer.deserialize({
    b: {
      x: "new x"
    }
  });

  expect(result.a).toBe(123);
  expect(result.b.x).toBe("new x");
  expect(result.b.y).toBe(456);
});
