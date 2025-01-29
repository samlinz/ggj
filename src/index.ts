import { getFlappyBubbleGameLogic } from "flappygame/flappy-game-logic";
// import { createKeyboardInputEmitter } from "input";
import { getUIRenderer } from "ui/canvas.renderer";
import { fatalError } from "./util/util";
import { loadRealGraphics } from "flappygame/flappy-images-loader";
import { createVoiceInputEmitter } from "./voiceinput";
import { buildConfig, Config } from "config";
import { createKeyboardInputEmitter } from "keyboardinput";
import { createTouchInputEmitter } from "touchinput";
import { flappyBubbleUiAdapter } from "flappygame/flappy-gfx-adapter";
import { getCanvas, initCanvas } from "ui/canvas";
import { initLogger } from "util/logger";

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

  const targetFps = config.targetFps;
  const targetDelta = 1000 / targetFps;
  let lastUpdate = 0;

  const scheduleNextFrame = () => {};

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
