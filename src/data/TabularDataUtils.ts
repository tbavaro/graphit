export function tabularDataToPOJOs<T>(
  headers: string[],
  input: Array<Array<T | undefined>>
): Array<{ [key: string]: T }> {
  return input.map(rowToPOJO(headers));
}

function rowToPOJO<T>(headers: string[]): (row: Array<T | undefined>) => { [key: string]: T } {
  return (row => {
    const output = {};
    headers.forEach((header, i) => {
      const value = row[i];
      if (value !== undefined) {
        output[header] = value;
      }
    });
    return output;
  });
}

export function pojosToTabularData<T>(
  objects: Array<{ [key: string]: T }>
): {
  headers: string[],
  rows: Array<Array<T | undefined>>
} {
  const propertyToIndex = new Map<string, number>();
  let nextIndex = 0;
  const rows: Array<Array<T | undefined>> = objects.map(obj => {
    const row: Array<T | undefined> = [];
    for (const key of Object.keys(obj)) {
      let index = propertyToIndex.get(key);
      if (index === undefined) {
        index = (nextIndex++);
        propertyToIndex.set(key, index);
      }
      row[index] = obj[key];
    }
    return row;
  });

  const headers: string[] = [];
  propertyToIndex.forEach((index, property) => headers[index] = property);
  return {
    headers: headers,
    rows: rows
  };
}
