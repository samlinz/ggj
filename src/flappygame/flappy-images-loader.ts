import { ScreenInfo } from "ui/canvas";
import { UIRenderer } from "ui/canvas.renderer";
import { loadImageElement } from "util/dom.util";

export const loadRealGraphics =
  (document: Document) => (screenInfo: ScreenInfo, renderer: UIRenderer) => {
    const loader = loadImageElement(document);

    const BUBBLE = renderer.loadSprite({
      frames: [
        renderer.loadFrame(loader("IMG_BUBBLE1")),
        renderer.loadFrame(loader("IMG_BUBBLE2")),
        renderer.loadFrame(loader("IMG_BUBBLE3")),
        renderer.loadFrame(loader("IMG_BUBBLE4")),
        renderer.loadFrame(loader("IMG_BUBBLE5")),
        renderer.loadFrame(loader("IMG_BUBBLE6")),
      ],
      frameTime: 100,
    });

    const PIPE_TOP = renderer.loadSprite({
      frame: renderer.loadFrame(loader("IMG_PIPETOP")),
    });

    const PIPE_BOTTOM = renderer.loadSprite({
      frame: renderer.loadFrame(loader("IMG_PIPEBOTTOM")),
    });

    const BG = renderer.loadSprite({
      frame: renderer.loadFrame(loader("IMG_BG")),
    });

    const GAMEOVER = renderer.loadSprite({
      frame: renderer.loadFrame(loader("IMG_GAMEOVER")),
    });

    const TITLE = renderer.loadSprite({
      frames: [
        renderer.loadFrame(loader("IMG_TITLE1")),
        renderer.loadFrame(loader("IMG_TITLE2")),
        renderer.loadFrame(loader("IMG_TITLE3")),
      ],
      frameTime: 500,
    });

    return {
      BUBBLE,
      PIPE_TOP,
      PIPE_BOTTOM,
      BG,
      GAMEOVER,
      TITLE,
    };
  };

export type LoadedFlappyGameGraphics = ReturnType<
  ReturnType<typeof loadRealGraphics>
>;
