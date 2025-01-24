export const CHARS_ALNUM =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
export const CHARS_LOWAL = "abcdefghijklmnopqrstuvwxyz";

export const generateRandomString = (
  length: number,
  characters = CHARS_ALNUM
) => {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

export const noop = () => {};

export const fatalError = (message: string): never => {
  log.fatal(message);
  document.write(`Fatal error: ${message}`);
  throw new Error(message);
};
