import { CanvasObjects, ScreenInfo } from "canvas";
import { fatalError } from "./util";

export type UISprite = {
  image: number;
  //   image: HTMLImageElement;
};

export type UIAnimation = {
  width: number;
  height: number;
  frames: UISprite[];
  frameTime: number;
};

export type UIAnimationInstance = {
  id: number;
  x: number;
  y: number;
  animation: number;
};

export type StoredAnimationState = {
  currentFrame: number;
  lastFrameChange: number;
};

export const UITextAnchorTop = 1;
export const UITextAnchorCenter = 1;
export type UIText = {
  x: number;
  y: number;
  value: string;
  anchor: number;
};

export type UIBox = {
  x: number;
  y: number;
  w: number;
  h: number;
};

export type UIWorld = {
  text: UIText[];
  sprites: UIAnimationInstance[];
  boxes: UIBox[];
};

export const UIImageTypeBox = 1;
export const UIImageTypeImg = 2;

type ImageBox = {
  type: typeof UIImageTypeBox;
  color: string;
};

type ImageImg = {
  type: typeof UIImageTypeImg;
  element: HTMLImageElement;
};

type Image = ImageBox | ImageImg;

export const getUIRenderer = ({
  ctx,
  height,
  width,
}: CanvasObjects & ScreenInfo) => {
  const images: Record<number, Image> = {};
  const animations: Record<number, UIAnimation> = {};
  const animationState: Record<number, StoredAnimationState> = {};

  const cls = () => {
    ctx.fillStyle = "silver";
    ctx.fillRect(0, 0, width, height);
  };

  const updateAnimation = (instance: UIAnimationInstance, now: number) => {
    const animation = animations[instance.animation];
    if (!animation) return;

    if (!animationState[instance.id]) {
      animationState[instance.id] = {
        currentFrame: 0,
        lastFrameChange: now,
      };
    }

    const storedState = animationState[instance.id];

    // Update animation
    if (animation.frames.length > 1) {
      if (now - storedState.lastFrameChange > animation.frameTime) {
        storedState.currentFrame =
          (storedState.currentFrame + 1) % animation.frames.length;

        storedState.lastFrameChange = now;
      }
    }
  };

  const renderSprite = (instance: UIAnimationInstance) => {
    const animation = animations[instance.animation];
    if (!animation) fatalError("No animation found", instance.animation);

    const storedState = animationState[instance.id];
    if (!storedState) fatalError("No stored state found", instance.id);

    const currentSprite = animation.frames[storedState.currentFrame];
    const image = images[currentSprite.image];

    if (!image)
      fatalError(
        `No animation image found ${currentSprite.image} for animation ${JSON.stringify(animation)}`
      );

    if (image.type === UIImageTypeBox) {
      // Filled box
      ctx.fillStyle = image.color;
      ctx.fillRect(instance.x, instance.y, animation.width, animation.height);
    } else if (image.type === UIImageTypeImg) {
      // Image
      ctx.drawImage(
        image.element,
        instance.x,
        instance.y,
        animation.width,
        animation.height
      );
    }

    // ctx.drawImage(
    //   currentSprite.image,
    //   currentSprite.x,
    //   currentSprite.y,
    //   currentSprite.width,
    //   currentSprite.height
    // );
  };

  return {
    loadImageRect(id: number, colour: string) {
      images[id] = { color: colour, type: UIImageTypeBox };
    },
    loadImage(id: number, element: HTMLImageElement) {
      images[id] = { type: UIImageTypeImg, element };
    },
    loadAnimation(id: number, animation: UIAnimation) {
      animations[id] = animation;
    },
    render(world: UIWorld, now: number) {
      // cls();

      world.sprites.forEach((sprite) => {
        updateAnimation(sprite, now);
        renderSprite(sprite);
      });

      if (world.boxes.length > 0) {
        ctx.fillStyle = "black";
        world.boxes.forEach((box) => {
          ctx.fillRect(box.x, box.y, box.w, box.h);
        });
      }

      if (world.text.length > 0) {
        ctx.font = "16px Arial";
        // ctx.textBaseline = "top";
        ctx.fillStyle = "black";
        world.text.forEach((text) => {
          ctx.textBaseline = text.anchor === UITextAnchorTop ? "top" : "middle";
          ctx.fillText(text.value, text.x, text.y);
        });
      }
    },
  };
};

export type UIRenderer = ReturnType<typeof getUIRenderer>;
