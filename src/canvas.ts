import { fatalError } from "./util";

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

const drawSomething = (
  ctx: CanvasRenderingContext2D,
  screen: ScreenInfo,
): void => {
  ctx.fillStyle = "red";
  ctx.fillRect(0, 0, screen.width, screen.height);

  // Redraw after resizing (optional)
  ctx.fillStyle = "blue";
  ctx.fillRect(50, 50, 100, 100);
  ctx.fillStyle = "red";
  ctx.beginPath();
  ctx.arc(300, 300, 50, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "white";
  ctx.font = "30px Arial";
  ctx.fillText("Hello, Canvas!", 400, 200);
};

export const initCanvas = (
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  canvasFixedWidth: number,
  canvasFixedHeight: number,
) => {
  const minMargin = 20;
  const maxWidth = canvasFixedWidth;
  const aspectRatio = canvasFixedWidth / canvasFixedHeight;

  canvas.width = canvasFixedWidth;
  canvas.height = canvasFixedHeight;

  // Handle window resizing
  function resizeCanvas() {
    const { innerWidth, innerHeight } = window;

    const availableWidth = innerWidth - 2 * minMargin;
    const availableHeight = innerHeight - 2 * minMargin;

    let newWidth = Math.min(maxWidth, availableWidth);
    let newHeight = newWidth / aspectRatio;

    if (newHeight > availableHeight) {
      newHeight = availableHeight;
      newWidth = availableHeight * aspectRatio;
    }

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
