import { fatalError } from "../util/util";
import { CanvasObjects, ScreenInfo } from "./canvas";
import {
  Image,
  StoredAnimationState,
  UIImageType,
  UISprite,
  UISpriteInstance,
  UISpriteStatic,
  UIWorld,
} from "./renderer.types";

export const getUIRenderer = ({
  ctx,
  height: screenHeight,
  width: screenWidth,
}: CanvasObjects & ScreenInfo) => {
  const images: Record<number, Image> = {};
  const animations: Record<number, UISprite> = {};
  const animationState: Record<number, StoredAnimationState> = {};

  let imageId = 0;
  let animationId = 0;

  const cls = (style: string) => {
    ctx.fillStyle = style;
    ctx.fillRect(0, 0, screenWidth, screenHeight);
  };

  const isSpriteStatic = (sprite: UISprite): sprite is UISpriteStatic => {
    return (sprite as UISpriteStatic).frame !== undefined;
  };

  const updateAnimation = (instance: UISpriteInstance, now: number) => {
    const animationId = instance.animation;

    const animation = animations[animationId];
    if (!animation) fatalError("No animation found", animationId);

    if (isSpriteStatic(animation)) return;

    const storedState = animationState[animationId];
    if (!storedState) fatalError("No animation instance found", animationId);

    // Update animation
    if (animation.frames.length > 1) {
      if (now - storedState.lastFrameChange > animation.frameTime) {
        storedState.currentFrame =
          (storedState.currentFrame + 1) % animation.frames.length;

        storedState.lastFrameChange = now;
      }
    }
  };

  const renderSprite = (instance: UISpriteInstance) => {
    const animationId = instance.animation;
    const animation = animations[animationId];
    if (!animation) fatalError("No animation found", animationId);

    const storedState = animationState[animationId];
    if (!storedState) fatalError("No stored state found", animationId);

    const currentSprite = isSpriteStatic(animation)
      ? animation.frame
      : animation.frames[storedState.currentFrame];

    const image = images[currentSprite];

    if (!image)
      fatalError(
        `No animation image found ${currentSprite} for animation ${JSON.stringify(animation)}`
      );

    switch (image.type) {
      case UIImageType.Box:
        ctx.fillStyle = image.color;
        ctx.fillRect(instance.x, instance.y, instance.w, instance.h);
        break;
      case UIImageType.Img:
        ctx.drawImage(
          image.element,
          instance.x,
          instance.y,
          instance.w,
          instance.h
        );
        break;
    }
  };

  const drawBoxes = (world: UIWorld, now: number) => {
    if (world.boxes.length > 0) {
      ctx.fillStyle = "black";
      world.boxes.forEach((box) => {
        ctx.fillRect(box.x, box.y, box.w, box.h);
      });
    }
  };

  const drawText = (world: UIWorld, now: number) => {
    if (world.text.length > 0) {
      ctx.font = "16px Arial";
      // ctx.textBaseline = "top";
      ctx.fillStyle = "black";
      world.text.forEach((text) => {
        ctx.textBaseline = text.anchor;
        ctx.fillText(text.value, text.x, text.y);
      });
    }
  };

  const drawSprite = (sprite: UISpriteInstance, now: number) => {
    updateAnimation(sprite, now);
    renderSprite(sprite);
  };

  const drawSprites = (world: UIWorld, now: number) => {
    world.sprites.forEach((instance) => {
      drawSprite(instance, now);
    });
  };

  const drawBackgrounds = (world: UIWorld, now: number) => {
    if (world.backgrounds.length > 0) {
      world.backgrounds.forEach((bg) => {
        drawSprite(
          {
            x: 0,
            y: 0,
            w: screenWidth,
            h: screenHeight,
            animation: bg.animation,
          },
          now
        );
      });
    } else {
      cls(world.bgColour || "white");
    }
  };

  const getNextImageId = () => imageId++;
  const getNextAnimationId = () => animationId++;

  return {
    loadImageRect(id: number, colour: string) {
      images[id] = { color: colour, type: UIImageType.Box };
    },
    loadFrame(element: HTMLImageElement) {
      const id = getNextImageId();

      images[id] = { type: UIImageType.Img, element };

      log.debug("Loading frame", { id, element: element.id });

      return id;
    },
    loadSprite(animation: UISprite) {
      const id = getNextAnimationId();

      animations[id] = animation;
      animationState[id] = {
        currentFrame: 0,
        lastFrameChange: 0,
      };

      log.debug("Loading sprite", { id, animation });

      return id;
    },
    render(world: UIWorld, now: number) {
      drawBackgrounds(world, now);
      drawSprites(world, now);
      drawBoxes(world, now);
      drawText(world, now);
    },
  };
};

export type UIRenderer = ReturnType<typeof getUIRenderer>;
