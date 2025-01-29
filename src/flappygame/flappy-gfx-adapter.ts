import {
  UIWorld,
  UIText,
  UISpriteInstance,
  UIBox,
  UIBackground,
  UITextAnchor,
} from "ui/renderer.types";
import { LoadedFlappyGameGraphics } from "./flappy-images-loader";
import { FlappyBubbleGameWorld } from "./flappy-game-logic";
import { ScreenInfo } from "ui/canvas";

const GAMEOVER_W = 500;
const GAMEOVER_H = 300;

const TITLE_W = 528;
const TITLE_H = 100;

// Take game world and convert to renderable UI state
// Doing this for every frame is probably inefficient but oh well
export const flappyBubbleUiAdapter =
  (loadedSprites: LoadedFlappyGameGraphics) =>
  (
    gameState: FlappyBubbleGameWorld,
    { width, height }: ScreenInfo
  ): UIWorld => {
    const text: UIText[] = [];
    const sprites: UISpriteInstance[] = [];
    const boxes: UIBox[] = [];
    const backgrounds: UIBackground[] = [];

    backgrounds.push({
      animation: loadedSprites.BG,
    });

    text.push({
      anchor: UITextAnchor.Top,
      value: `Score: ${gameState.score}`,
      x: 10,
      y: 10,
    });

    if (gameState.state === "gameover") {
      sprites.push({
        x: width / 2 - GAMEOVER_W / 2,
        y: height / 2 - GAMEOVER_H / 2,
        w: GAMEOVER_W,
        h: GAMEOVER_H,
        animation: loadedSprites.GAMEOVER,
      });
    } else if (gameState.state === "starting") {
      sprites.push({
        x: width / 2 - TITLE_W / 2,
        y: height / 2 - TITLE_H / 2,
        w: TITLE_W,
        h: TITLE_H,
        animation: loadedSprites.TITLE,
      });
    } else {
      sprites.push({
        x: Math.round(gameState.player.x),
        y: Math.round(gameState.player.y),
        w: gameState.player.width,
        h: gameState.player.height,
        animation: loadedSprites.BUBBLE,
      });

      sprites.push(
        ...gameState.boxes.map((box, i) => ({
          x: Math.round(box.x),
          y: Math.round(box.y),
          w: box.width,
          h: box.height,
          animation:
            i % 2 === 0 ? loadedSprites.PIPE_TOP : loadedSprites.PIPE_BOTTOM,
        }))
      );
    }

    return {
      text,
      sprites,
      boxes,
      backgrounds,
    };
  };
