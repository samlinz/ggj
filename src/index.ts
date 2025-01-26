import { getCanvas, initCanvas } from "canvas";
import { getFlappyBubbleGameLogic } from "flappygame";
// import { createKeyboardInputEmitter } from "input";
import { getUIRenderer } from "ui";
import { fatalError, noop } from "./util";
import { flappyBubbleUiAdapter, loadRealGraphics } from "gfx";
import { createVoiceInputEmitter } from "./voiceinput";
import { buildConfig, Config } from "config";

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

const init = async () => {
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

  // const keyboardInput = createKeyboardInputEmitter({
  //   ...canvas,
  //   document,
  // });

  const voiceInput = createVoiceInputEmitter({
    ...canvas,
    document,
    config,
  });

  // keyboardInput.init();
  await voiceInput.init();

  const renderer = getUIRenderer(canvasInfo);

  // loadTestGraphics(renderer);
  loadRealGraphics(document)(canvasInfo, renderer);

  const gameLogic = getFlappyBubbleGameLogic();
  gameLogic.init(canvasInfo);
  // gameLogic.setWorld({
  //   boxes: [
  //     {
  //       x: 100,
  //       y: 100,
  //       width: 10,
  //       height: 10,
  //     },
  //   ],
  //   player: {
  //     x: 10,
  //     y: 10,
  //     width: 10,
  //     height: 10,
  //     // direction: 2,
  //     // speed: 50,
  //     movement: [0, 0],
  //   },
  //   gravity: [0, 9.8],
  //   // gravity: [0, 5],
  // });

  const onRequestAnimationFrame = (delta: number) => {
    const now = Date.now(); // probably accurate enough

    // Get input
    // const input = keyboardInput.getAndClearBuffer();
    const input = voiceInput.getAndClearBuffer();

    // Update game state
    gameLogic.update(delta, input);

    const gameState = gameLogic.getWorld();
    if (gameState) {
      const uiWorld = flappyBubbleUiAdapter(gameState, canvasInfo);

      // Update UI
      renderer.render(uiWorld, now);
    }

    // Request next frame
    window.requestAnimationFrame(onRequestAnimationFrame);
  };

  // Start loop
  onRequestAnimationFrame(0);
};

document.addEventListener("DOMContentLoaded", async () => {
  try {
    await init();
  } catch (error) {
    fatalError("Failed to initialize game", error);
  }
});
