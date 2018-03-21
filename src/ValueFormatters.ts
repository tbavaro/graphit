export interface ValueFormatter<T> {
  format(value: T): string;
}

export const ValueFormatters = {
  raw: {
    format: (value: any) => {
      return value.toString();
    }
  },
  roundedInt: {
    format: (value: number) => {
      return Math.round(value).toString();
    }
  },
  fixedPrecision: (precision: number) => {
    return {
      format: (value: number) => {
        return value.toFixed(precision);
      }
    };
  }
};
