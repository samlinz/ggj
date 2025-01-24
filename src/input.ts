import { CanvasObjects } from "canvas";

export const ACTION_UP = "up";
export const ACTION_LEFT = "left";
export const ACTION_RIGHT = "right";
export const ACTION_DOWN = "down";

export type ActionUp = {
  type: typeof ACTION_UP;
};

export type ActionLeft = {
  type: typeof ACTION_LEFT;
};

export type ActionRight = {
  type: typeof ACTION_RIGHT;
};

export type ActionDown = {
  type: typeof ACTION_DOWN;
};

// type Action = {
//     type: string;
//     payload: unknown;
// };

export type Action = ActionUp | ActionLeft | ActionRight | ActionDown;

export const createKeyboardInputEmitter = ({
  document,
}: CanvasObjects & { document: Document }) => {
  const keys: Record<string, number> = {};

  const inputBuffer: Action[] = [];

  const addAction = (action: Action) => {
    log.debug("Action", { type: action.type });
    inputBuffer.push(action);
  };

  const onKeyPressed = (key: string) => {
    if (key === "ArrowUp") {
      return void addAction({ type: "up" });
    }

    if (key === "ArrowLeft") {
      return void addAction({ type: "left" });
    }

    if (key === "ArrowRight") {
      return void addAction({ type: "right" });
    }

    if (key === "ArrowDown") {
      return void addAction({ type: "down" });
    }
  };

  const onKeyHeld = (key: string, duration: number) => {
    //
  };

  const keyDownHandler = (e: KeyboardEvent) => {
    const oldState = keys[e.key];
    keys[e.key] = Date.now();

    if (!oldState) {
      // Key was pressed
      onKeyPressed(e.key);
    }
  };

  const keyUpHandler = (e: KeyboardEvent) => {
    const oldState = keys[e.key];
    delete keys[e.key];

    if (oldState) {
      // Key was released
      const now = Date.now();
      const duration = now - oldState;
      onKeyHeld(e.key, duration);
    }
  };

  const init = () => {
    document.addEventListener("keydown", keyDownHandler);
    document.addEventListener("keyup", keyUpHandler);
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
