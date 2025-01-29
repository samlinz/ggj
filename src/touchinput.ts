import { Action, ACTION_UP } from "flappygame/flappy-game-actions";
import { CanvasObjects } from "ui/canvas";

export const createTouchInputEmitter = ({
  canvas,
}: CanvasObjects & { document: Document }) => {
  const inputBuffer: Action[] = [];

  const addAction = (action: Action) => {
    log.debug("Action", { type: action.type });
    inputBuffer.push(action);
  };

  const tapHandler = () => {
    addAction({ type: ACTION_UP });
  };

  const init = async () => {
    canvas.addEventListener("pointerdown", tapHandler);
  };

  const getAndClearBuffer = () => {
    const buffer = inputBuffer.slice();
    inputBuffer.length = 0;
    return buffer;
  };

  return {
    init,
    getAndClearBuffer,
  };
};
