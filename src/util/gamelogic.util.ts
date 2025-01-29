export const pixelsMoved = (speed: number, delta: number) => {
  // pixels per second and timedelta as milliseconds
  return speed * delta;
};

export const boxesOverlap = (
  box1: ObjectDimensions,
  box2: ObjectDimensions
) => {
  return (
    box1.x < box2.x + box2.width &&
    box1.x + box1.width > box2.x &&
    box1.y < box2.y + box2.height &&
    box1.y + box1.height > box2.y
  );
};

export const boxesOverlapWithTolerance = (
  box1: ObjectDimensions,
  box2: ObjectDimensions,
  tolerance: number = 0
) => {
  return (
    box1.x < box2.x + box2.width - tolerance &&
    box1.x + box1.width > box2.x + tolerance &&
    box1.y < box2.y + box2.height - tolerance &&
    box1.y + box1.height > box2.y + tolerance
  );
};

export const randomInt = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

export type ObjectDimensions = {
  x: number;
  y: number;
  width: number;
  height: number;
};
