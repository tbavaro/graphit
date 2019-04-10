
export type DeepReadonly<T> = (
  T extends Array<infer U>
    ? Array<Readonly<U>>
    : T extends object
      ? { readonly [P in keyof T]: DeepReadonly<T[P]> }
      : Readonly<T>
);

export function deepFreeze<T>(object: T): DeepReadonly<T> {
  Object.freeze(object);
  // TODO make this deep
  return object as DeepReadonly<T>;
}
