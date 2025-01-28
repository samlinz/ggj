import { ScreenInfo } from "canvas";
import { FlappyBubbleGameWorld } from "flappygame";
import {
  UISpriteInstance,
  UIBox,
  UIRenderer,
  UIText,
  UITextAnchorTop,
  UIWorld,
  UIBackground,
} from "ui";
import { fatalError } from "./util";

export const loadImageElement = (document: Document) => (id: string) => {
  const img = document.getElementById(id) as HTMLImageElement;

  if (!img) {
    fatalError(`Image with id ${id} not found`);
  }

  return img;
};

export const PLAYER_W = 50;
export const PLAYER_H = 50;

export const PIPE_W = 100;
export const PIPE_H = 827;

const GAMEOVER_W = 500;
const GAMEOVER_H = 300;

const TITLE_W = 528;
const TITLE_H = 100;

export const loadRealGraphics =
  (document: Document) => (screenInfo: ScreenInfo, renderer: UIRenderer) => {
    const loader = loadImageElement(document);

    const BUBBLE = renderer.loadSprite({
      frames: [
        renderer.loadFrame(loader("IMG_BUBBLE1")),
        renderer.loadFrame(loader("IMG_BUBBLE2")),
        renderer.loadFrame(loader("IMG_BUBBLE3")),
        renderer.loadFrame(loader("IMG_BUBBLE4")),
        renderer.loadFrame(loader("IMG_BUBBLE5")),
        renderer.loadFrame(loader("IMG_BUBBLE6")),
      ],
      frameTime: 100,
    });

    const PIPE_TOP = renderer.loadSprite({
      frame: renderer.loadFrame(loader("IMG_PIPETOP")),
    });

    const PIPE_BOTTOM = renderer.loadSprite({
      frame: renderer.loadFrame(loader("IMG_PIPEBOTTOM")),
    });

    const BG = renderer.loadSprite({
      frame: renderer.loadFrame(loader("IMG_BG")),
    });

    const GAMEOVER = renderer.loadSprite({
      frame: renderer.loadFrame(loader("IMG_GAMEOVER")),
    });

    const TITLE = renderer.loadSprite({
      frames: [
        renderer.loadFrame(loader("IMG_TITLE1")),
        renderer.loadFrame(loader("IMG_TITLE2")),
        renderer.loadFrame(loader("IMG_TITLE3")),
      ],
      frameTime: 500,
    });

    return {
      BUBBLE,
      PIPE_TOP,
      PIPE_BOTTOM,
      BG,
      GAMEOVER,
      TITLE,
    };
  };

export type LoadedSprites = ReturnType<ReturnType<typeof loadRealGraphics>>;

// const centeredText = (text: string, { height, width }: ScreenInfo): UIText => {
//   const x = width / 2 - text.length * 5;
//   const y = height / 2;
//   return { x, y, value: text, anchor: UITextAnchorCenter };
// };

export const flappyBubbleUiAdapter =
  (loadedSprites: LoadedSprites) =>
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
      anchor: UITextAnchorTop,
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
          id: 40 + i,
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
