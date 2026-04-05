// Web Audio API sound effects — no external files needed
// Mechanical keyboard-inspired clicks with warm, satisfying tones

let audioCtx: AudioContext | null = null;
let _audioEnabled = localStorage.getItem('chimera_audio') !== 'false';

export function isAudioEnabled() { return _audioEnabled; }
export function setAudioEnabled(enabled: boolean) {
  _audioEnabled = enabled;
  localStorage.setItem('chimera_audio', String(enabled));
}

function getCtx(): AudioContext {
  if (!_audioEnabled) throw new Error('audio disabled');
  if (!audioCtx) audioCtx = new AudioContext();
  return audioCtx;
}

/** Short percussive click — used for tab/nav switching */
export function playTabClick() {
  try {
    const ctx = getCtx();
    const now = ctx.currentTime;

    // Layer 1: sharp attack click
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(1800, now);
    osc1.frequency.exponentialRampToValueAtTime(600, now + 0.06);
    gain1.gain.setValueAtTime(0.12, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc1.connect(gain1).connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.08);

    // Layer 2: warm body thump
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(400, now);
    osc2.frequency.exponentialRampToValueAtTime(180, now + 0.05);
    gain2.gain.setValueAtTime(0.08, now);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    osc2.connect(gain2).connect(ctx.destination);
    osc2.start(now);
    osc2.stop(now + 0.06);
  } catch {
    // Silently fail if audio not available
  }
}

/** Soft pop — used for button presses, item interactions */
export function playButtonPress() {
  try {
    const ctx = getCtx();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(900, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);
    gain.gain.setValueAtTime(0.07, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.05);
  } catch {
    // Silently fail
  }
}

/** Success chime — used for purchases, quest completion */
export function playSuccess() {
  try {
    const ctx = getCtx();
    const now = ctx.currentTime;

    [660, 880, 1100].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      const t = now + i * 0.08;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.08, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.15);
    });
  } catch {
    // Silently fail
  }
}

/** Rare drop — two-note rising chime */
export function playRareDrop() {
  try {
    const ctx = getCtx();
    const now = ctx.currentTime;
    [700, 1050].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      const t = now + i * 0.1;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.1, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.25);
    });
  } catch {}
}

/** Epic drop — three rising notes with harmonic shimmer */
export function playEpicDrop() {
  try {
    const ctx = getCtx();
    const now = ctx.currentTime;
    [600, 900, 1200].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      const t = now + i * 0.09;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.12, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.35);
    });
  } catch {}
}

/** Legendary drop — dramatic fanfare with bass hit */
export function playLegendaryDrop() {
  try {
    const ctx = getCtx();
    const now = ctx.currentTime;

    // Bass impact
    const bass = ctx.createOscillator();
    const bassGain = ctx.createGain();
    bass.type = 'sine';
    bass.frequency.setValueAtTime(120, now);
    bass.frequency.exponentialRampToValueAtTime(60, now + 0.15);
    bassGain.gain.setValueAtTime(0.15, now);
    bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    bass.connect(bassGain).connect(ctx.destination);
    bass.start(now);
    bass.stop(now + 0.3);

    // Rising fanfare
    [550, 700, 880, 1100, 1320].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      const t = now + 0.05 + i * 0.07;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.1, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.4);
    });
  } catch {}
}

/** Celestial drop — ethereal shimmer with detuned oscillators */
export function playCelestialDrop() {
  try {
    const ctx = getCtx();
    const now = ctx.currentTime;

    // Deep reverb-like pad
    const pad = ctx.createOscillator();
    const padGain = ctx.createGain();
    pad.type = 'sine';
    pad.frequency.setValueAtTime(180, now);
    padGain.gain.setValueAtTime(0.08, now);
    padGain.gain.linearRampToValueAtTime(0.12, now + 0.2);
    padGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    pad.connect(padGain).connect(ctx.destination);
    pad.start(now);
    pad.stop(now + 0.8);

    // Shimmering detuned notes
    [880, 885, 1320, 1325, 1760].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      const t = now + i * 0.06;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.06, t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.6);
    });
  } catch {}
}

/** Level up — triumphant ascending arpeggio */
export function playLevelUp() {
  try {
    const ctx = getCtx();
    const now = ctx.currentTime;

    // Bass punch
    const bass = ctx.createOscillator();
    const bassGain = ctx.createGain();
    bass.type = 'sine';
    bass.frequency.setValueAtTime(150, now);
    bass.frequency.exponentialRampToValueAtTime(80, now + 0.1);
    bassGain.gain.setValueAtTime(0.12, now);
    bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    bass.connect(bassGain).connect(ctx.destination);
    bass.start(now);
    bass.stop(now + 0.2);

    // Major arpeggio: C5 E5 G5 C6
    [523, 659, 784, 1047].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      const t = now + 0.05 + i * 0.1;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.1, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.35);
    });
  } catch {}
}

/** Sell/coin sound — weighty coin drop with metallic ring */
export function playSellItem() {
  try {
    const ctx = getCtx();
    const now = ctx.currentTime;

    // Thud — weight of the coin hitting
    const thud = ctx.createOscillator();
    const thudGain = ctx.createGain();
    thud.type = 'sine';
    thud.frequency.setValueAtTime(200, now);
    thud.frequency.exponentialRampToValueAtTime(80, now + 0.06);
    thudGain.gain.setValueAtTime(0.1, now);
    thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    thud.connect(thudGain).connect(ctx.destination);
    thud.start(now);
    thud.stop(now + 0.1);

    // Metallic ring — satisfying high clink
    [2400, 1900, 2800].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      const t = now + 0.02 + i * 0.04;
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.5, t + 0.12);
      gain.gain.setValueAtTime(0.05, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.15);
    });
  } catch {}
}

/** Equip sound — metallic clank */
export function playEquip() {
  try {
    const ctx = getCtx();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.08);
    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.12);
  } catch {}
}

/** Quest start — adventurous horn note */
export function playQuestStart() {
  try {
    const ctx = getCtx();
    const now = ctx.currentTime;
    [440, 550, 660].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      const t = now + i * 0.12;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.09, t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.2);
    });
  } catch {}
}
