'use client';

// All sound effects are synthesised with the Web Audio API - no audio
// files to host, upload or license. Browsers block audio until a user
// gesture unlocks the AudioContext, which matters here because the
// display page runs unattended - see unlockAudio().

let audioCtx = null;
let unlocked = false;

function ctx() {
  if (!audioCtx) {
    const Ctor = window.AudioContext || window.webkitAudioContext;
    audioCtx = new Ctor();
  }
  return audioCtx;
}

export function isAudioUnlocked() {
  return unlocked;
}

export function unlockAudio() {
  const c = ctx();
  if (c.state === 'suspended') c.resume();
  // near-silent blip, required on some browsers (iOS Safari) to fully
  // unlock playback for the rest of the page's lifetime
  const osc = c.createOscillator();
  const gain = c.createGain();
  gain.gain.value = 0.0001;
  osc.connect(gain).connect(c.destination);
  osc.start();
  osc.stop(c.currentTime + 0.05);
  unlocked = true;
}

function tone(c, out, { freq, type = 'sine', start = 0, duration = 0.4, peak = 0.6, freqEnd = null }) {
  const osc = c.createOscillator();
  osc.type = type;
  const t0 = c.currentTime + start;
  osc.frequency.setValueAtTime(freq, t0);
  if (freqEnd) osc.frequency.exponentialRampToValueAtTime(freqEnd, t0 + duration);

  const gain = c.createGain();
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(peak, t0 + Math.min(0.02, duration / 4));
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

  osc.connect(gain).connect(out);
  osc.start(t0);
  osc.stop(t0 + duration + 0.05);
}

function noiseBuffer(c, duration) {
  const size = Math.floor(c.sampleRate * duration);
  const buffer = c.createBuffer(1, size, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < size; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
}

function noiseBurst(c, out, { start = 0, duration = 0.08, peak = 0.5, filterFreq = null }) {
  const src = c.createBufferSource();
  src.buffer = noiseBuffer(c, duration);

  let node = src;
  if (filterFreq) {
    const filter = c.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = filterFreq;
    src.connect(filter);
    node = filter;
  }

  const t0 = c.currentTime + start;
  const gain = c.createGain();
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(peak, t0 + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

  node.connect(gain).connect(out);
  src.start(t0);
  src.stop(t0 + duration + 0.02);
}

const EFFECTS = {
  gong(c, out) {
    tone(c, out, { freq: 110, freqEnd: 70, duration: 2.4, peak: 0.8 });
    tone(c, out, { freq: 220, freqEnd: 140, duration: 2.0, peak: 0.3 });
  },
  chime(c, out) {
    [880, 1318, 1760].forEach((freq, i) => tone(c, out, { freq, start: i * 0.03, duration: 1.1, peak: 0.35 }));
  },
  sparkle(c, out) {
    [660, 880, 1100, 1320, 1760].forEach((freq, i) =>
      tone(c, out, { freq, type: 'triangle', start: i * 0.07, duration: 0.35, peak: 0.4 })
    );
  },
  horn(c, out) {
    tone(c, out, { freq: 220, type: 'sawtooth', duration: 0.3, peak: 0.5 });
    tone(c, out, { freq: 330, type: 'sawtooth', start: 0.28, duration: 0.5, peak: 0.55 });
  },
  fanfare(c, out) {
    [523, 659, 784, 1046].forEach((freq, i) => tone(c, out, { freq, type: 'square', start: i * 0.14, duration: 0.5, peak: 0.35 }));
    tone(c, out, { freq: 1046, type: 'square', start: 0.56, duration: 0.9, peak: 0.4 });
  },
  drumroll(c, out) {
    const hits = 14;
    for (let i = 0; i < hits; i++) {
      noiseBurst(c, out, { start: i * (0.5 / hits), duration: 0.06, peak: 0.35, filterFreq: 2000 });
    }
    noiseBurst(c, out, { start: 0.55, duration: 0.3, peak: 0.7, filterFreq: 1200 });
  },
  applause(c, out) {
    for (let i = 0; i < 40; i++) {
      noiseBurst(c, out, {
        start: Math.random() * 1.6,
        duration: 0.05 + Math.random() * 0.05,
        peak: 0.15 + Math.random() * 0.15,
        filterFreq: 3000 + Math.random() * 3000
      });
    }
  },
  bell_toll(c, out) {
    tone(c, out, { freq: 196, duration: 3, peak: 0.7 });
    tone(c, out, { freq: 392, duration: 2.2, peak: 0.25 });
    tone(c, out, { freq: 588, duration: 1.6, peak: 0.15 });
  }
};

export function playSoundEffect(key, volumePercent = 70) {
  if (typeof window === 'undefined') return;
  const fn = EFFECTS[key];
  if (!fn) return;
  const c = ctx();
  if (c.state === 'suspended') c.resume();
  const master = c.createGain();
  master.gain.value = Math.max(0, Math.min(1, volumePercent / 100));
  master.connect(c.destination);
  fn(c, master);
}
