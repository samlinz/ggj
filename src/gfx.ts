import { ScreenInfo } from "canvas";
import { FlappyBubbleGameWorld } from "flappygame";
import {
  UIAnimationInstance,
  UIBox,
  UIRenderer,
  UIText,
  UITextAnchorCenter,
  UITextAnchorTop,
  UIWorld,
} from "ui";
import { fatalError } from "./util";

export const ANIM_PLAYER = 0;
export const ANIM_PIPETOP = 1;
export const ANIM_PIPEBOTTOM = 2;
export const ANIM_BG = 3;
export const ANIM_GAMEOVER = 4;
export const ANIM_TITLE = 5;

// export const PLAYER_W = 100;
// export const PLAYER_H = 100;

export const BOX_W = 10;
export const BOX_H = 10;

export const loadImage = (document: Document) => (id: string) => {
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

export const IMG_BUBBLE_1 = 1;
export const IMG_BUBBLE_2 = 2;
export const IMG_BUBBLE_3 = 3;
export const IMG_BUBBLE_4 = 4;
export const IMG_BUBBLE_5 = 5;
export const IMG_BUBBLE_6 = 6;

// export const IMG_RED = 7;
// export const IMG_BLUE = 8;

export const IMG_PIPE_TOP = 10;
export const IMG_PIPE_BOTTOM = 11;

export const IMG_TITLE_1 = 20;
export const IMG_TITLE_2 = 21;
export const IMG_TITLE_3 = 22;

export const IMG_GAMEOVER = 30;

export const IMG_BG_EMPTY = 40;

export const IMG_BG_GAME = 50;

export const IMG_BEER = 60;

export const loadRealGraphics =
  (document: Document) => (screenInfo: ScreenInfo, renderer: UIRenderer) => {
    const loader = loadImage(document);

    renderer.loadImage(IMG_BUBBLE_1, loader("IMG_BUBBLE1"));
    renderer.loadImage(IMG_BUBBLE_2, loader("IMG_BUBBLE2"));
    renderer.loadImage(IMG_BUBBLE_3, loader("IMG_BUBBLE3"));
    renderer.loadImage(IMG_BUBBLE_4, loader("IMG_BUBBLE3"));
    renderer.loadImage(IMG_BUBBLE_5, loader("IMG_BUBBLE3"));

    renderer.loadImage(IMG_PIPE_TOP, loader("IMG_PIPETOP"));
    renderer.loadImage(IMG_PIPE_BOTTOM, loader("IMG_PIPEBOTTOM"));

    renderer.loadImage(IMG_TITLE_1, loader("IMG_TITLE1"));
    renderer.loadImage(IMG_TITLE_2, loader("IMG_TITLE2"));
    renderer.loadImage(IMG_TITLE_3, loader("IMG_TITLE3"));

    renderer.loadImage(IMG_GAMEOVER, loader("IMG_GAMEOVER"));

    renderer.loadImage(IMG_BG_EMPTY, loader("IMG_BG"));

    renderer.loadImage(IMG_BEER, loader("IMG_LAGER"));

    renderer.loadAnimation(ANIM_PLAYER, {
      frames: [
        {
          image: IMG_BUBBLE_1,
        },
        {
          image: IMG_BUBBLE_2,
        },
        {
          image: IMG_BUBBLE_3,
        },
      ],
      frameTime: 100,
      width: PLAYER_W,
      height: PLAYER_H,
    });

    renderer.loadAnimation(ANIM_PIPETOP, {
      frames: [
        {
          image: IMG_PIPE_TOP,
        },
      ],
      frameTime: 0,
      width: PIPE_W,
      height: PIPE_H,
    });

    renderer.loadAnimation(ANIM_PIPEBOTTOM, {
      frames: [
        {
          image: IMG_PIPE_BOTTOM,
        },
      ],
      frameTime: 0,
      width: PIPE_W,
      height: PIPE_H,
    });

    renderer.loadAnimation(ANIM_BG, {
      frames: [
        {
          image: IMG_BG_EMPTY,
        },
      ],
      frameTime: 0,
      width: screenInfo.width,
      height: screenInfo.height,
    });

    renderer.loadAnimation(ANIM_GAMEOVER, {
      frames: [
        {
          image: IMG_GAMEOVER,
        },
      ],
      frameTime: 0,
      width: GAMEOVER_W,
      height: GAMEOVER_H,
    });

    renderer.loadAnimation(ANIM_TITLE, {
      frames: [
        {
          image: IMG_TITLE_1,
        },
        {
          image: IMG_TITLE_2,
        },
        {
          image: IMG_TITLE_3,
        },
      ],
      frameTime: 500,
      width: TITLE_W,
      height: TITLE_H,
    });
  };

// export const loadTestGraphics = (renderer: UIRenderer) => {
//   renderer.loadImageRect(IMG_RED, "red");
//   renderer.loadImageRect(IMG_BLUE, "blue");

//   renderer.loadAnimation(ANIM_PLAYER, {
//     width: PLAYER_W,
//     height: PLAYER_H,
//     frameTime: 1000,
//     frames: [
//       {
//         image: IMG_RED,
//       },
//     ],
//   });

//   renderer.loadAnimation(ANIM_BOX, {
//     width: BOX_W,
//     height: BOX_H,
//     frameTime: 1000,
//     frames: [
//       {
//         image: IMG_RED,
//       },
//       {
//         image: IMG_BLUE,
//       },
//     ],
//   });
// };

// export const gameStateToUiState = (gameState: GameWorld): UIWorld => {
//   return {
//     text: [
//       {
//         x: 0,
//         y: 0,
//         value: `${gameState.player.movement[0]},${gameState.player.movement[1]}`,
//       },
//     ],
//     sprites: [
//       {
//         x: Math.round(gameState.player.x),
//         y: Math.round(gameState.player.y),
//         animation: ANIM_PLAYER,
//         id: 0,
//       },
//       ...gameState.boxes.map((box, index) => ({
//         x: Math.round(box.x),
//         y: Math.round(box.y),
//         animation: ANIM_BOX,
//         id: index + 1,
//       })),
//     ],
//   };
// };

const centeredText = (text: string, { height, width }: ScreenInfo): UIText => {
  const x = width / 2 - text.length * 5;
  const y = height / 2;
  return { x, y, value: text, anchor: UITextAnchorCenter };
};

export const flappyBubbleUiAdapter = (
  gameState: FlappyBubbleGameWorld,
  { width, height }: ScreenInfo
): UIWorld => {
  const text: UIText[] = [];
  const sprites: UIAnimationInstance[] = [];
  const boxes: UIBox[] = [];

  sprites.push({
    id: 0,
    x: 0,
    y: 0,
    animation: ANIM_BG,
  });

  text.push({
    anchor: UITextAnchorTop,
    value: `Score: ${gameState.score}`,
    x: 10,
    y: 10,
  });

  if (gameState.state === "gameover") {
    // text.push(centeredText("Game Over", { height, width }));
    sprites.push({
      id: 10,
      x: width / 2 - GAMEOVER_W / 2,
      y: height / 2 - GAMEOVER_H / 2,
      animation: ANIM_GAMEOVER,
    });
  } else if (gameState.state === "starting") {
    sprites.push({
      id: 20,
      x: width / 2 - TITLE_W / 2,
      y: height / 2 - TITLE_H / 2,
      animation: ANIM_TITLE,
    });
  } else {
    sprites.push({
      id: 30,
      animation: ANIM_PLAYER,
      x: Math.round(gameState.player.x),
      y: Math.round(gameState.player.y),
    });

    sprites.push(
      ...gameState.boxes.map((box, i) => ({
        id: 40 + i,
        x: Math.round(box.x),
        y: Math.round(box.y),
        animation: i % 2 === 0 ? ANIM_PIPETOP : ANIM_PIPEBOTTOM,
      }))
    );

    // boxes.push(
    //   ...gameState.boxes.map((box) => ({
    //     x: Math.round(box.x),
    //     y: Math.round(box.y),
    //     w: box.width,
    //     h: box.height,
    //   }))
    // );
  }

  return {
    text,
    // text: [
    //   // {
    //   //   x: 0,
    //   //   y: 0,
    //   //   value: `${gameState.player.movement[0]},${gameState.player.movement[1]}`,
    //   // },
    // ],
    // sprites: [
    //   {
    //     x: Math.round(gameState.player.x),
    //     y: Math.round(gameState.player.y),
    //     animation: ANIM_PLAYER,
    //     id: 0,
    //   },
    // ],
    sprites,
    boxes,
    // sprites: [
    //   // ...gameState.boxes.map((box, i) => ({
    //   //   x: Math.round(box.x),
    //   //   y: Math.round(box.y),
    //   //   // w: box.width,
    //   //   // h: box.height,
    //   // })),
    // ],
    // boxes: [
    //   // {
    //   //   x: Math.round(gameState.player.x),
    //   //   y: Math.round(gameState.player.y),
    //   //   w: gameState.player.width,
    //   //   h: gameState.player.height,
    //   // },
    // ],
  };
};
