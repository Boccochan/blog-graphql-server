export const btoa = (str: string) => {
  const result = new Buffer(str).toString("base64");
  return result;
};
