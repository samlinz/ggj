import { getCanvas, initCanvas } from "canvas";
import { noop } from "./util";
import { getUIRenderer, UIWorld } from "ui";

type Config = {
  debug: boolean;
  canvasElementId: string;
  screenWidth: number;
  screenHeight: number;
};

const buildConfig = (): Config => {
  // process.env is set by build system
  const debug = process.env.ENV === "development";

  return {
    debug,
    canvasElementId: "gameCanvas",
    screenWidth: 1024,
    screenHeight: 768,
  };
};

const initLogger = (config: Config) => {
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

const init = () => {
  const config = buildConfig();

  initLogger(config);

  log.info("Initializing game", {
    config,
  });

  const canvas = getCanvas(config.canvasElementId);

  const canvasInfo = initCanvas(
    canvas.canvas,
    canvas.ctx,
    config.screenWidth,
    config.screenHeight
  );

  const renderer = getUIRenderer(canvasInfo);

  let uiWorld: UIWorld = {
    sprites: [
      {
        x: 10,
        y: 10,
        width: 100,
        height: 100,
      },
    ],
  };

  setInterval(() => {
    uiWorld.sprites[0].x += 1;
  }, 10);

  const onRequestAnimationFrame = () => {
    renderer.render(uiWorld);
    window.requestAnimationFrame(onRequestAnimationFrame);
  };

  onRequestAnimationFrame();
};

document.addEventListener("DOMContentLoaded", init);
