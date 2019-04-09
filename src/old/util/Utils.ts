// TODO use ES6 as a target or find a better way to do this
export function iterableForEach<T>(
  values: Iterable<T>,
  func: (value: T) => void
) {
  const iterator: Iterator<T> = (values as any)[Symbol.iterator]();
  while (true) {
    const next = iterator.next();
    if (next.done) {
      break;
    } else {
      func(next.value);
    }
  }
}

export function forSome<T>(
  values: T[],
  func: (value: T, index: number) => void,
  indexes?: Iterable<number>
) {
  if (indexes === undefined) {
    values.forEach(func);
  } else {
    iterableForEach(indexes, index => {
      if (index < 0 || index >= values.length) {
        throw new Error("index out of range: " + index);
      }
      const value = values[index];
      func(value, index);
    });
  }
}
