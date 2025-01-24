import { CanvasObjects, ScreenInfo } from "canvas";

export type UISprite = {
  x: number;
  y: number;
  width: number;
  height: number;
  //   image: HTMLImageElement;
};

export type UIWorld = {
  sprites: UISprite[];
};

export const getUIRenderer = ({
  ctx,
  canvas,
  height,
  width,
}: CanvasObjects & ScreenInfo) => {
  const cls = () => {
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, width, height);
  };

  return {
    render(world: UIWorld) {
      cls();

      ctx.fillStyle = "red";
      world.sprites.forEach((sprite) => {
        ctx.fillRect(sprite.x, sprite.y, sprite.width, sprite.height);
      });
    },
  };
};
