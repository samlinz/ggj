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

export type UIText = {
  x: number;
  y: number;
  value: string;
};

export type UIWorld = {
  text: UIText[];
  sprites: UIAnimationInstance[];
};

type ImageBox = {
  type: 1;
  color: string;
};

type Image = ImageBox;

export const getUIRenderer = ({
  ctx,
  canvas,
  height,
  width,
}: CanvasObjects & ScreenInfo) => {
  const images: Record<number, Image> = {};
  const animations: Record<number, UIAnimation> = {};
  const animationState: Record<number, StoredAnimationState> = {};

  const cls = () => {
    ctx.fillStyle = "white";
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

    if (image.type === 1) {
      // Filled box
      ctx.fillStyle = image.color;
    }

    ctx.fillRect(instance.x, instance.y, animation.width, animation.height);

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
      images[id] = { color: colour, type: 1 };
    },
    loadAnimation(id: number, animation: UIAnimation) {
      animations[id] = animation;
    },
    render(world: UIWorld, now: number) {
      cls();

      world.sprites.forEach((sprite) => {
        updateAnimation(sprite, now);
        renderSprite(sprite);
      });

      if (world.text.length > 0) {
        ctx.font = "16px Arial";
        ctx.textBaseline = "top";
        ctx.fillStyle = "black";
        world.text.forEach((text) => {
          ctx.fillText(text.value, text.x, text.y);
        });
      }
    },
  };
};

export type UIRenderer = ReturnType<typeof getUIRenderer>;
