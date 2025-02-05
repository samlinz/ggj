export type Config = {
  debug: boolean;
  canvasElementId: string;
  screenWidth: number;
  screenHeight: number;
  voiceInputClarityThreshold: number;
  voiceInputPitchTreshold1: number;
  voiceInputPitchTreshold2: number;
  voiceInputPitchTreshold3: number;
  voiceInputUpdateInterval: number;
  targetFps: number;
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
    voiceInputPitchTreshold1: 50,
    voiceInputPitchTreshold2: 80,
    voiceInputPitchTreshold3: 300,
    voiceInputUpdateInterval: 100,
    targetFps: 60,
  };
};
