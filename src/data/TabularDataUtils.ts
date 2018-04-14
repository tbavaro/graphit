export function tabularDataToPOJOs<T>(
  headers: string[],
  input: Array<T | undefined>[]
): { [key: string]: T }[] {
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
