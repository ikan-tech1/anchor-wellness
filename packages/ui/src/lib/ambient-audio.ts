let audioCtx: AudioContext | null = null;
let noiseNode: AudioBufferSourceNode | null = null;
let gainNode: GainNode | null = null;

function getContext() {
  if (!audioCtx) audioCtx = new AudioContext();
  return audioCtx;
}

function createNoiseBuffer(ctx: AudioContext, type: "white" | "pink" | "brown") {
  const bufferSize = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let b0 = 0,
    b1 = 0,
    b2 = 0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    if (type === "white") {
      data[i] = white * 0.15;
    } else if (type === "pink") {
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.969 * b2 + white * 0.153852;
      data[i] = (b0 + b1 + b2) * 0.08;
    } else {
      data[i] = (b0 = (b0 + 0.02 * white) / 1.02) * 3.5;
    }
  }
  return buffer;
}

export async function playAmbient(soundId: string) {
  stopAmbient();
  if (soundId === "silence") return;

  const ctx = getContext();
  if (ctx.state === "suspended") await ctx.resume();

  gainNode = ctx.createGain();
  gainNode.gain.value = 0.12;
  gainNode.connect(ctx.destination);

  const noiseType =
    soundId === "white_noise" ? "white" : soundId === "rain" ? "pink" : "brown";
  const buffer = createNoiseBuffer(ctx, noiseType);
  noiseNode = ctx.createBufferSource();
  noiseNode.buffer = buffer;
  noiseNode.loop = true;
  noiseNode.connect(gainNode);
  noiseNode.start();
}

export function stopAmbient() {
  try {
    noiseNode?.stop();
  } catch {
    /* already stopped */
  }
  noiseNode = null;
  gainNode = null;
}
