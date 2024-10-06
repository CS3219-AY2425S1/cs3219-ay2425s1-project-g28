// eslint-disable-next-line  @typescript-eslint/no-explicit-any
const isString = (obj: any): obj is string => {
  return typeof obj === "string";
};

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
const isStringArray = (obj: any): obj is Array<string> => {
  return Array.isArray(obj) && obj.every((item) => isString(item));
};

export { isString, isStringArray };
