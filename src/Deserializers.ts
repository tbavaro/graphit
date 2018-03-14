export type DeepPartial<T> = {
  [P in keyof T]?: T[P] | DeepPartial<T[P]>
};

export interface Deserializer<SERIALIZED_T, T> {
  deserialize(data: SERIALIZED_T | undefined): T;
}

export class SimpleDeserializer<SERIALIZED_T, T> {
  readonly specialFieldDeserializers: {
    [P in keyof SERIALIZED_T]?: Deserializer<SERIALIZED_T[P], any /* T[P] */>;
  };

  readonly defaultValueFactory: () => T;

  constructor(
    defaultValueFactory: () => T,
    specialFieldDeserializers?: {
      [P in keyof SERIALIZED_T]?: Deserializer<SERIALIZED_T[P], any /* T[P] */>;
    }
  ) {
    this.defaultValueFactory = defaultValueFactory;
    this.specialFieldDeserializers = specialFieldDeserializers || {};
  }

  deserialize(data: SERIALIZED_T | undefined): T {
    var result = this.defaultValueFactory();
    if (data !== undefined) {
      for (let key of Object.keys(data)) {
        const value = data[key];
        if (key in this.specialFieldDeserializers) {
          result[key] = this.specialFieldDeserializers[key].deserialize(value);
        } else {
          result[key] = this._deserializePrimitiveOrArrayOfPrimitives(key, value);
        }
      }
    }
    return result;
  }

  private _deserializePrimitiveOrArrayOfPrimitives(mostRecentKey: string, value: any): any {
    if (typeof value === "object") {
      if (value instanceof Array) {
        return this._deserializeArrayOfPrimitives(mostRecentKey, value);
      } else {
        throw new Error("no deserializer specified for object in key: " + mostRecentKey);
      }
    } else {
      return value;
    }
  }

  private _deserializeArrayOfPrimitives(mostRecentKey: string, values: any[]): any[] {
    return values.map((value) => this._deserializePrimitiveOrArrayOfPrimitives(mostRecentKey + "[]", value));
  }
}

export class SimplePartialDeserializer<T> extends SimpleDeserializer<DeepPartial<T>, T> {}
