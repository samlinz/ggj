export const CHARS_ALNUM =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
export const CHARS_LOWAL = "abcdefghijklmnopqrstuvwxyz";

export const generateRandomString = (
  length: number,
  characters = CHARS_ALNUM,
) => {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

export const noop = () => {};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const fatalError = (...args: any[]): never => {
  log.fatal(...args);
  document.write(`Fatal error: ${args.join(" ")}`);
  throw new Error("Fatal error");
};
