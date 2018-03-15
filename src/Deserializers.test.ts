import {
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

const barDeserializer = new SimplePartialDeserializer<Bar>({
  defaultValueFactory: () => {
    return {
      x: "default x",
      y: 456
    };
  }
});

const fooDeserializer = new SimplePartialDeserializer<Foo>({
  defaultValueFactory: () => {
    return {
      a: 123,
      b: barDeserializer.defaultValueFactory()
    };
  },
  specialFieldDeserializers: {
    b: barDeserializer
  }
});

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

it("test blacklist", () => {
  const barDeserializerWithBlacklist = new SimplePartialDeserializer<Bar>({
    defaultValueFactory: barDeserializer.defaultValueFactory,
    fieldBlacklist: [
      "bad_field",
      "y"
    ]
  });

  const data = {
    "x": "new x",
    "y": 1000,
    "bad_field": "foo"
  } as any;

  var normalResult = barDeserializer.deserialize(data);
  expect(normalResult.x).toBe("new x");
  expect(normalResult.y).toBe(1000);
  expect("bad_field" in normalResult).toBe(true);
  expect((normalResult as any).bad_field).toBe("foo");

  var blacklistedResult = barDeserializerWithBlacklist.deserialize(data);
  expect(blacklistedResult.x).toBe("new x");
  expect(blacklistedResult.y).toBe(456);
  expect("bad_field" in blacklistedResult).toBe(false);
});

it("test whitelist", () => {
  const barDeserializerWithWhitelist = new SimplePartialDeserializer<Bar>({
    defaultValueFactory: barDeserializer.defaultValueFactory,
    fieldWhitelist: [
      "y"
    ]
  });

  const data = {
    "x": "new x",
    "y": 1000,
    "bad_field": "foo"
  } as any;

  var whitelistedResult = barDeserializerWithWhitelist.deserialize(data);
  expect(whitelistedResult.x).toBe("default x");
  expect(whitelistedResult.y).toBe(1000);
  expect("bad_field" in whitelistedResult).toBe(false);
});
