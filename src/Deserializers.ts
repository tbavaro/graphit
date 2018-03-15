export type DeepPartial<T> = {
  [P in keyof T]?: T[P] | DeepPartial<T[P]>
};

export interface Deserializer<SERIALIZED_T, T> {
  deserialize(data: SERIALIZED_T | undefined): T;
}

export class SimpleDeserializer<SERIALIZED_T, T> {
  readonly specialFieldDeserializers: {
    [P in keyof SERIALIZED_T & keyof T]?: Deserializer<SERIALIZED_T[P], T[P]>;
  };

  readonly defaultValueFactory: () => T;
  readonly fieldWhitelist?: Set<keyof SERIALIZED_T>;
  readonly fieldBlacklist: Set<string>;

  constructor(attrs: {
    defaultValueFactory: () => T;
    specialFieldDeserializers?: {
      [P in keyof SERIALIZED_T & keyof T]?: Deserializer<SERIALIZED_T[P], T[P]>;
    };
    fieldWhitelist?: (keyof SERIALIZED_T)[],
    fieldBlacklist?: string[]
  }) {
    this.defaultValueFactory = attrs.defaultValueFactory;
    this.specialFieldDeserializers = attrs.specialFieldDeserializers || {};
    if (attrs.fieldWhitelist !== undefined) {
      this.fieldWhitelist = new Set(attrs.fieldWhitelist);
      if (attrs.fieldBlacklist !== undefined) {
        throw new Error("it doesn't make sense to specify a blacklist and a whitelist");
      }
    }
    this.fieldBlacklist = new Set(attrs.fieldBlacklist || []);
  }

  deserialize(data: SERIALIZED_T | undefined): T {
    var result = this.defaultValueFactory();
    if (data !== undefined) {
      for (let key of Object.keys(data)) {
        // if this isn't whitelisted, or it's blacklisted, skip it
        if (
          (this.fieldWhitelist !== undefined && !this.fieldWhitelist.has(key as any)) ||
          this.fieldBlacklist.has(key)
        ) {
          continue;
        }

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
