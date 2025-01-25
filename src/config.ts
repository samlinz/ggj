export type Config = {
  debug: boolean;
  canvasElementId: string;
  screenWidth: number;
  screenHeight: number;
  voiceInputClarityThreshold: number;
  voiceInputPitchTreshold: number;
  voiceInputUpdateInterval: number;
};

export type WithConfig = {
  config: Config;
};

export const buildConfig = (): Config => {
  // process.env is set by build system
  const debug = process.env.ENV === "development";

  return {
    debug,
    canvasElementId: "gameCanvas",
    screenWidth: 1024,
    screenHeight: 768,
    voiceInputClarityThreshold: 90,
    voiceInputPitchTreshold: 100,
    voiceInputUpdateInterval: 100,
  };
};
