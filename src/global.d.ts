/* eslint-disable @typescript-eslint/no-explicit-any */
type Logger = {
  fatal: (...args: any[]) => void;
  error: (...args: any[]) => void;
  warn: (...args: any[]) => void;
  info: (...args: any[]) => void;
  debug: (...args: any[]) => void;
};

declare global {
  const log: Logger;

  interface Window {
    log: Logger;
  }
}

export {};
