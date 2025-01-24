import { GameWorld } from "game";
import { UIRenderer, UIWorld } from "ui";

export const ANIM_PLAYER = 0;
export const ANIM_BOX = 1;

export const IMG_RED = 0;
export const IMG_BLUE = 1;

export const PLAYER_W = 100;
export const PLAYER_H = 100;

export const BOX_W = 10;
export const BOX_H = 10;

export const loadTestGraphics = (renderer: UIRenderer) => {
  renderer.loadImageRect(IMG_RED, "red");
  renderer.loadImageRect(IMG_BLUE, "blue");

  renderer.loadAnimation(ANIM_PLAYER, {
    width: PLAYER_W,
    height: PLAYER_H,
    frameTime: 1000,
    frames: [
      {
        image: IMG_RED,
      },
    ],
  });

  renderer.loadAnimation(ANIM_BOX, {
    width: BOX_W,
    height: BOX_H,
    frameTime: 1000,
    frames: [
      {
        image: IMG_RED,
      },
      {
        image: IMG_BLUE,
      },
    ],
  });
};

export const gameStateToUiState = (gameState: GameWorld): UIWorld => {
  return {
    text: [
      {
        x: 0,
        y: 0,
        value: `${gameState.player.movement[0]},${gameState.player.movement[1]}`,
      },
    ],
    sprites: [
      {
        x: Math.round(gameState.player.x),
        y: Math.round(gameState.player.y),
        animation: ANIM_PLAYER,
        id: 0,
      },
      ...gameState.boxes.map((box, index) => ({
        x: Math.round(box.x),
        y: Math.round(box.y),
        animation: ANIM_BOX,
        id: index + 1,
      })),
    ],
  };
};
