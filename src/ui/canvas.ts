import { fatalError } from "util/util";

export type ScreenInfo = {
  width: number;
  height: number;
};

export type CanvasObjects = {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
};

const buildScreenInfo = ({ canvas }: CanvasObjects): ScreenInfo => {
  return {
    width: canvas.width,
    height: canvas.height,
  };
};

export const initCanvas = (
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  canvasFixedWidth: number,
  canvasFixedHeight: number
) => {
  const minMargin = 20;
  const maxWidth = canvasFixedWidth;
  const aspectRatio = canvasFixedWidth / canvasFixedHeight;

  // const isProbablyMobileScreen = true;
  const isProbablyMobileScreen = window.innerWidth < window.innerHeight;

  canvas.width = canvasFixedWidth;
  canvas.height = canvasFixedHeight;

  type ScreenSize = {
    innerWidth: number;
    innerHeight: number;
  };

  if (isProbablyMobileScreen) {
    canvas.classList.add("landscape");
    document.getElementById("input-list")?.classList.add("landscape");
  }

  const resizeLandscape = ({ innerWidth, innerHeight }: ScreenSize) => {
    return {
      newWidth: innerHeight,
      newHeight: innerWidth,
    };
  };

  const resizeDesktop = ({ innerWidth, innerHeight }: ScreenSize) => {
    const availableWidth = innerWidth - 2 * minMargin;
    const availableHeight = innerHeight - 2 * minMargin;

    let newWidth = Math.min(maxWidth, availableWidth);
    let newHeight = newWidth / aspectRatio;

    if (newHeight > availableHeight) {
      newHeight = availableHeight;
      newWidth = availableHeight * aspectRatio;
    }

    return { newWidth, newHeight };
  };

  // Handle window resizing
  function resizeCanvas() {
    const { innerWidth, innerHeight } = window;

    const { newWidth, newHeight } = isProbablyMobileScreen
      ? resizeLandscape({ innerWidth, innerHeight })
      : resizeDesktop({ innerWidth, innerHeight });

    canvas.style.width = `${newWidth}px`;
    canvas.style.height = `${newHeight}px`;

    // drawSomething(ctx, buildScreenInfo({ canvas, ctx }));
    return buildScreenInfo({ canvas, ctx });
  }

  window.addEventListener("resize", resizeCanvas);

  return {
    canvas,
    ctx,
    ...resizeCanvas(),
  };
};

export const getCanvas = (id: string) => {
  const canvas = document.getElementById(id) as HTMLCanvasElement;

  if (!canvas) {
    fatalError(`Canvas element with id ${id} not found`);
  }

  const ctx = canvas.getContext("2d");

  if (!ctx) {
    fatalError(`Could not get 2d context for canvas with id ${id}`);
  }

  return {
    canvas,
    ctx: ctx as CanvasRenderingContext2D,
  };
};
