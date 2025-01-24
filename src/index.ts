import { getCanvas, initCanvas } from "canvas";
import { getGameLogic } from "game";
import { createKeyboardInputEmitter } from "input";
import { getUIRenderer } from "ui";
import { noop } from "./util";
import { gameStateToUiState, loadTestGraphics } from "gfx";

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

  const keyboardInput = createKeyboardInputEmitter({
    ...canvas,
    document,
  });

  keyboardInput.init();

  const renderer = getUIRenderer(canvasInfo);

  loadTestGraphics(renderer);

  const gameLogic = getGameLogic();
  gameLogic.setWorld({
    boxes: [
      {
        x: 100,
        y: 100,
        width: 10,
        height: 10,
      },
    ],
    player: {
      x: 10,
      y: 10,
      width: 10,
      height: 10,
      // direction: 2,
      // speed: 50,
      movement: [0, 0],
    },
    gravity: [0, 9.8],
  });

  const onRequestAnimationFrame = (delta: number) => {
    const now = Date.now(); // probably accurate enough

    // Get input
    const input = keyboardInput.getAndClearBuffer();

    // Update game state
    gameLogic.update(delta, input);

    const gameState = gameLogic.getWorld();
    if (gameState) {
      const uiWorld = gameStateToUiState(gameState);

      // Update UI
      renderer.render(uiWorld, now);
    }

    // Request next frame
    window.requestAnimationFrame(onRequestAnimationFrame);
  };

  // Start loop
  onRequestAnimationFrame(0);
};

document.addEventListener("DOMContentLoaded", init);
