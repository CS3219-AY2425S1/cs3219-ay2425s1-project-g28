export const isMatchingPage = (path: string) => {
  const pattern = /^(?<prefix>\/matching)(?<ignore>\/.*)*$/;
  return pattern.test(path);
};

export const isCollabPage = (path: string) => {
  const pattern = /^(?<prefix>\/collaboration)(?<ignore>\/.*)*$/;
  return pattern.test(path);
};
