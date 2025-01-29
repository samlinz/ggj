import { Config } from "config";
import { noop } from "./util";

export const initLogger = (config: Config) => {
  const logger = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fatal: (...args: any[]) => console.error(`FATAL: `, ...args),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    error: (...args: any[]) => console.error(`ERROR: `, ...args),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    warn: (...args: any[]) => console.warn(`WARN: `, ...args),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    info: (...args: any[]) => console.info(`INFO: `, ...args),
    debug: config.debug
      ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (...args: any[]) => console.debug(`DEBUG: `, ...args)
      : noop,
  };

  window.log = logger;
};
