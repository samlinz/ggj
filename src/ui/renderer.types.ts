export type UIImageId = number;
export type UIAnimationId = number;

export type UISpriteAnimated = {
  frames: UIImageId[];
  frameTime: number;
};

export type UISpriteStatic = {
  frame: UIImageId;
};

export type UISprite = UISpriteAnimated | UISpriteStatic;

export type UISpriteInstance = {
  x: number;
  y: number;
  w: number;
  h: number;
  animation: UIAnimationId;
};

export type StoredAnimationState = {
  currentFrame: number;
  lastFrameChange: number;
};

export enum UITextAnchor {
  Top = "top",
  Middle = "middle",
  Bottom = "bottom",
}

export type UIText = {
  x: number;
  y: number;
  value: string;
  anchor: UITextAnchor;
};

export type UIBox = {
  x: number;
  y: number;
  w: number;
  h: number;
};

// export enum UIBackgroundType {
//   Image,
//   Colour,
// }

export type UIBackground = {
  animation: UIAnimationId;
};

export type UIWorld = {
  text: UIText[];
  sprites: UISpriteInstance[];
  boxes: UIBox[];
  backgrounds: UIBackground[];
  bgColour?: string;
};

export enum UIImageType {
  Box,
  Img,
}

export type ImageBox = {
  type: UIImageType.Box;
  color: string;
};

export type ImageImg = {
  type: UIImageType.Img;
  element: HTMLImageElement;
};

export type Image = ImageBox | ImageImg;
