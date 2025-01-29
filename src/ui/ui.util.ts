import { ScreenInfo } from "./canvas";
import { UIText, UITextAnchor } from "./renderer.types";

export const centeredText = (
  text: string,
  { height, width }: ScreenInfo
): UIText => {
  const x = width / 2 - text.length * 5;
  const y = height / 2;
  return { x, y, value: text, anchor: UITextAnchor.Middle };
};
