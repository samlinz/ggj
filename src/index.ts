import { getCanvas, initCanvas } from "canvas";
import { getFlappyBubbleGameLogic } from "flappygame";
// import { createKeyboardInputEmitter } from "input";
import { getUIRenderer } from "ui";
import { fatalError, noop } from "./util";
import { flappyBubbleUiAdapter, loadRealGraphics } from "gfx";
import { createVoiceInputEmitter } from "./voiceinput";
import { buildConfig, Config } from "config";
import { createKeyboardInputEmitter } from "keyboardinput";
import { createTouchInputEmitter } from "touchinput";

const inputChangeElements = {
  voice: document.getElementById("input-voice"),
  keyboard: document.getElementById("input-keyboard"),
  touch: document.getElementById("input-touch"),
};

const inputType = localStorage.getItem("inputType") || "voice";

Object.entries(inputChangeElements).forEach(([key, element]) => {
  if (key === inputType) {
    element!.classList.add("selected");
  }

  element!.addEventListener("click", () => {
    localStorage.setItem("inputType", key);
    window.location.reload();
  });
});

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

  let input: ReturnType<typeof createVoiceInputEmitter>;

  switch (inputType) {
    case "voice":
      input = createVoiceInputEmitter({
        ...canvas,
        document,
        config,
      });
      break;
    case "keyboard":
      input = createKeyboardInputEmitter({
        ...canvas,
        document,
      });
      break;
    case "touch":
      input = createTouchInputEmitter({
        ...canvas,
        document,
      });
      break;
    default:
      return void fatalError("Unknown input type", inputType);
  }

  await input.init();

  const renderer = getUIRenderer(canvasInfo);

  // loadTestGraphics(renderer);
  const loadedSprites = loadRealGraphics(document)(canvasInfo, renderer);
  const uiAdapter = flappyBubbleUiAdapter(loadedSprites);

  const gameLogic = getFlappyBubbleGameLogic();
  gameLogic.init(canvasInfo);

  const targetFps = 60;
  const targetDelta = 1000 / targetFps;
  let lastUpdate = 0;

  const scheduleNextFrame = () => {
    window.requestAnimationFrame(onRequestAnimationFrame);
  };

  const onRequestAnimationFrame = (time: number) => {
    const delta = time - lastUpdate;
    if (delta < targetDelta) {
      return void scheduleNextFrame();
    }

    lastUpdate = time - (delta % targetDelta);

    const now = Date.now(); // probably accurate enough

    // Get input
    const inputBuffer = input.getAndClearBuffer();
    // const input = voiceInput.getAndClearBuffer();

    // Update game state
    gameLogic.update(time, inputBuffer);

    const gameState = gameLogic.getWorld();
    if (gameState) {
      const uiWorld = uiAdapter(gameState, canvasInfo);

      // Update UI
      renderer.render(uiWorld, now);
    }

    // Request next frame
    // window.requestAnimationFrame(onRequestAnimationFrame);
    return void scheduleNextFrame();
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
