import { CanvasObjects } from "canvas";
import { WithConfig } from "config";
import { Action, ACTION_DOWN, ACTION_UP } from "flappygame";
import { PitchDetector } from "pitchy";

export const createVoiceInputEmitter = ({
  document,
  config,
}: CanvasObjects & { document: Document } & WithConfig) => {
  const inputBuffer: Action[] = [];

  const getAndClearBuffer = () => {
    const buffer = inputBuffer.slice();
    inputBuffer.length = 0;
    return buffer;
  };

  const updatePitch = (
    analyserNode: AnalyserNode,
    detector: PitchDetector<Float32Array<ArrayBufferLike>>,
    input: Float32Array<ArrayBuffer>,
    sampleRate: number
  ) => {
    analyserNode.getFloatTimeDomainData(input);
    const [pitch, clarity] = detector.findPitch(input, sampleRate);

    const pitchNormalized = Math.round(pitch * 10) / 10;
    const clarityNormalized = Math.round(clarity * 100);

    if (clarityNormalized > config.voiceInputClarityThreshold) {
      log.debug({ clarity: clarityNormalized, pitch: pitchNormalized });

      // if (
      //   pitchNormalized > config.voiceInputPitchTreshold1 &&
      //   pitchNormalized < config.voiceInputPitchTreshold2
      // ) {
      //   inputBuffer.push({ type: ACTION_DOWN });
      // }

      if (
        pitchNormalized > config.voiceInputPitchTreshold2 &&
        pitchNormalized < config.voiceInputPitchTreshold3
      ) {
        inputBuffer.push({ type: ACTION_UP });
      }
    }

    setTimeout(() => {
      updatePitch(analyserNode, detector, input, sampleRate);
    }, config.voiceInputUpdateInterval);
  };

  const init = async () => {
    const audioContext = new window.AudioContext();
    const analyserNode = audioContext.createAnalyser();

    document.onclick = () => {
      audioContext.resume();
    };

    const mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });

    audioContext.createMediaStreamSource(mediaStream).connect(analyserNode);
    const detector = PitchDetector.forFloat32Array(analyserNode.fftSize);
    // detector.minVolumeDecibels = -10;

    const input = new Float32Array(detector.inputLength);

    updatePitch(analyserNode, detector, input, audioContext.sampleRate);
  };

  return {
    init,
    getAndClearBuffer,
  };
};
