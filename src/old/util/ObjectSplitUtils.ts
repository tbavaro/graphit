export function splitObject<
  T extends {},
  OTHER_KEY extends string,
  OUT_OTHER extends {},
  OUT extends { OTHER_KEY: OUT_OTHER }
>(
  input: T,
  topLevelProperties: Iterable</* keyof T & keyof U */string>,
  otherDataProperty: OTHER_KEY,
  defaultValues?: Partial<T & OUT>,
  defaultOtherDataValues?: OUT_OTHER)
: OUT {
  const topLevelPropertiesSet = new Set(topLevelProperties);

  const otherData = { ...(defaultOtherDataValues as {}) } as OUT_OTHER;
  const output = { ...(defaultValues as {}) } as OUT;
  if (defaultValues !== undefined) {
    if (otherDataProperty in defaultValues) {
      throw new Error(
        `default values can't contain \`${otherDataProperty}\`; pass \`defaultOtherDataValues\` instead`);
    }
  }
  (output as any)[otherDataProperty] = otherData;

  for (const key of Object.keys(input)) {
    const target = (topLevelPropertiesSet.has(key as any) ? output : otherData);
    target[key] = input[key];
  }
  return output;
}

export function splitObjects<
T extends {},
OTHER_KEY extends string,
OUT_OTHER extends {},
OUT extends { OTHER_KEY: OUT_OTHER }
>(
  inputs: T[],
  topLevelProperties: Iterable</* keyof T & keyof U */string>,
  otherDataProperty: OTHER_KEY,
  defaultValues?: Partial<T & OUT>,
  defaultOtherDataValues?: OUT_OTHER)
: OUT[] {
  return inputs.map(input => splitObject<T, OTHER_KEY, OUT_OTHER, OUT>(
    input,
    topLevelProperties,
    otherDataProperty,
    defaultValues,
    defaultOtherDataValues
  ));
}
