export type Vec2 = [number, number];

export const vec2Add = (a: Vec2, b: Vec2): Vec2 => [a[0] + b[0], a[1] + b[1]];
export const vec2Subtract = (a: Vec2, b: Vec2): Vec2 => [
  a[0] - b[0],
  a[1] - b[1],
];

export const vec2Scale = (a: Vec2, scalar: number): Vec2 => [
  a[0] * scalar,
  a[1] * scalar,
];

export const vec2Length = (a: Vec2): number =>
  Math.sqrt(a[0] * a[0] + a[1] * a[1]);

export const vec2Normalize = (a: Vec2): Vec2 => {
  const length = vec2Length(a);
  return length === 0 ? [0, 0] : [a[0] / length, a[1] / length];
};
