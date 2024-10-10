export const isMatchingPage = (path: string) => {
  const pattern = /^(?<prefix>\/matching)(?<ignore>\/.*)*$/;
  return pattern.test(path);
};
