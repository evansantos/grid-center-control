// Sound Effects LITE — Web Audio API oscillators only, no audio files

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext();
  return audioCtx;
}

export function isSoundEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('grid-sound-enabled') !== 'false';
}

export function setSoundEnabled(v: boolean): void {
  localStorage.setItem('grid-sound-enabled', v ? 'true' : 'false');
}

export function getVolume(): number {
  if (typeof window === 'undefined') return 0.3;
  const v = localStorage.getItem('grid-sound-volume');
  return v != null ? parseFloat(v) : 0.3;
}

export function setVolume(v: number): void {
  localStorage.setItem('grid-sound-volume', String(Math.max(0, Math.min(1, v))));
}

function playTone(freq: number, duration: number, type: OscillatorType = 'sine', onSetup?: (osc: OscillatorNode, gain: GainNode, ctx: AudioContext) => void) {
  if (!isSoundEnabled()) return;
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.value = getVolume();
  osc.connect(gain);
  gain.connect(ctx.destination);
  if (onSetup) onSetup(osc, gain, ctx);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}

/** High pitch short ding */
export function playNotification(): void {
  playTone(880, 0.15, 'sine', (_osc, gain, ctx) => {
    gain.gain.setValueAtTime(getVolume(), ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
  });
}

/** Ascending two-tone */
export function playTaskComplete(): void {
  const ctx = getCtx();
  if (!isSoundEnabled()) return;
  const vol = getVolume();
  [523, 659].forEach((f, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = f;
    gain.gain.value = vol;
    osc.connect(gain);
    gain.connect(ctx.destination);
    const t = ctx.currentTime + i * 0.12;
    osc.start(t);
    osc.stop(t + 0.1);
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
  });
}

/** Low buzz error */
export function playError(): void {
  playTone(120, 0.3, 'sawtooth', (_osc, gain, ctx) => {
    gain.gain.setValueAtTime(getVolume() * 0.6, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
  });
}

/** Sci-fi sweep */
export function playSpawn(): void {
  if (!isSoundEnabled()) return;
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(200, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.3);
  gain.gain.setValueAtTime(getVolume() * 0.5, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.4);
}
