export const btoa = (str: string) => {
  const result = Buffer.from(str).toString("base64");
  return result;
};

export const atob = (str: string) => {
  const result = Buffer.from(str, "base64").toString();
  return result;
};
