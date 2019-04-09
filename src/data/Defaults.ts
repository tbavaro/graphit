import { DeepReadonly } from "./DeepReadonly";

/**
 * limitations:
 *   - conditional types are going to be trouble
 *   - you lose the "deepness" of DeepRequired once you hit an array
 *   - arrays are assumed to have a default value of []; defaults should
 *     specify a single element though that contains the default fields
 *     to apply to each entry
 */

export type DeepRequired<T> = (
  T extends (infer U)[]
    ? Required<U>[]  // TODO should be DeepRequired
    : T extends object
        ? { [P in keyof T]-?: DeepRequired<Exclude<T[P], undefined>> }
        : T
);

/**
 * Same as {@type DeepRequired} except enforces the single array entry requirement.
 */
// TODO i don't think typescript supports this yet, but if we could make it *only* require
// the optional fields from T that would be ideal
export type Defaults<T> = (
  T extends (infer U)[]
    ? [Required<U>]
    : T extends object
        ? { [P in keyof T]-?: Defaults<Exclude<T[P], undefined>> }
        : T
);

function isObject(value: any): value is object {
  return typeof value === "object" && !(value instanceof Array) && value !== null;
}

export function applyDefaults<T extends object>(
  object: T,
  defaults: Defaults<T> | DeepReadonly<Defaults<T>>
): DeepRequired<T> {
  for (const key of Object.keys(defaults)) {
    const defaultValue = defaults[key];
    if (defaultValue instanceof Array && defaultValue.length !== 1) {
      throw new Error("default values for arrays should have exactly 1 entry");
    }

    const value = object[key];
    if (value === undefined) {
      // arrays always default to empty; defaults should list a single
      // value to demonstrate the default though
      object[key] = (defaultValue instanceof Array) ? [] : defaultValue;
    } else {
      if (value instanceof Array) {
        const defaultEntryValue = defaultValue[0];
        value.forEach(entryValue => {
          if (isObject(entryValue)) {
            applyDefaults(entryValue, defaultEntryValue);
          }
        });
      } else if (isObject(value)) {
        applyDefaults(value, defaultValue);
      }
    }
  }

  return (object as DeepRequired<T>);
}

export function createFromDefaults<T extends object>(defaults: DeepRequired<T>): T {
  return applyDefaults({} as any, defaults);
}
