'use client';

// All sound effects are synthesised with the Web Audio API - no audio
// files to host, upload or license. A shared reverb bus and a master
// compressor glue the effects together so they read as one coherent
// "sound design" instead of raw beeps. Browsers block audio until a user
// gesture unlocks the AudioContext, which matters here because the
// display page runs unattended - see unlockAudio().

let audioCtx = null;
let unlocked = false;
let compressor = null;
let reverbConvolver = null;
let reverbReturn = null;

function ctx() {
  if (!audioCtx) {
    const Ctor = window.AudioContext || window.webkitAudioContext;
    audioCtx = new Ctor();
  }
  return audioCtx;
}

function getCompressor(c) {
  if (!compressor) {
    compressor = c.createDynamicsCompressor();
    compressor.threshold.value = -20;
    compressor.knee.value = 24;
    compressor.ratio.value = 4;
    compressor.attack.value = 0.003;
    compressor.release.value = 0.25;
    compressor.connect(c.destination);
  }
  return compressor;
}

function makeImpulseResponse(c) {
  const duration = 1.7;
  const decay = 2.8;
  const rate = c.sampleRate;
  const length = Math.floor(rate * duration);
  const impulse = c.createBuffer(2, length, rate);
  for (let ch = 0; ch < 2; ch++) {
    const data = impulse.getChannelData(ch);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / length) ** decay;
    }
  }
  return impulse;
}

function getReverbBus(c) {
  if (!reverbConvolver) {
    reverbConvolver = c.createConvolver();
    reverbConvolver.buffer = makeImpulseResponse(c);
    reverbReturn = c.createGain();
    reverbReturn.gain.value = 0.7;
    reverbConvolver.connect(reverbReturn);
    reverbReturn.connect(getCompressor(c));
  }
  return reverbConvolver;
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

// ---------- building blocks ----------

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

// three slightly detuned oscillators layered together - classic trick for
// a richer, more "brass ensemble" timbre instead of a single thin tone
function detunedTone(c, out, { freq, type = 'sawtooth', start = 0, duration = 0.5, peak = 0.5, detuneCents = 8 }) {
  [-detuneCents, 0, detuneCents].forEach((det) => {
    const osc = c.createOscillator();
    osc.type = type;
    osc.frequency.value = freq;
    osc.detune.value = det;
    const t0 = c.currentTime + start;
    const gain = c.createGain();
    const p = peak / 3;
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(p, t0 + Math.min(0.02, duration / 4));
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    osc.connect(gain).connect(out);
    osc.start(t0);
    osc.stop(t0 + duration + 0.05);
  });
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

// ---------- effects ----------

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
  crown_fanfare(c, out) {
    [523, 659, 784].forEach((freq) => detunedTone(c, out, { freq, duration: 1.6, peak: 0.32 }));
    detunedTone(c, out, { freq: 1046, duration: 1.8, peak: 0.38, start: 0.25 });
    detunedTone(c, out, { freq: 1318, duration: 1.6, peak: 0.28, start: 0.5 });
  },
  whoosh(c, out) {
    const dur = 0.5;
    const t0 = c.currentTime;
    const src = c.createBufferSource();
    src.buffer = noiseBuffer(c, dur);
    const filter = c.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 0.7;
    filter.frequency.setValueAtTime(300, t0);
    filter.frequency.exponentialRampToValueAtTime(4000, t0 + dur * 0.8);
    const gain = c.createGain();
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(0.5, t0 + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(filter).connect(gain).connect(out);
    src.start(t0);
    src.stop(t0 + dur + 0.05);
  },
  riser(c, out) {
    const dur = 2.0;
    const t0 = c.currentTime;

    const osc = c.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(110, t0);
    osc.frequency.exponentialRampToValueAtTime(880, t0 + dur);
    const gain = c.createGain();
    gain.gain.setValueAtTime(0.001, t0);
    gain.gain.exponentialRampToValueAtTime(0.5, t0 + dur * 0.9);
    gain.gain.linearRampToValueAtTime(0, t0 + dur + 0.05);
    osc.connect(gain).connect(out);
    osc.start(t0);
    osc.stop(t0 + dur + 0.1);

    const src = c.createBufferSource();
    src.buffer = noiseBuffer(c, dur);
    const filter = c.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(200, t0);
    filter.frequency.exponentialRampToValueAtTime(3000, t0 + dur);
    const ngain = c.createGain();
    ngain.gain.setValueAtTime(0.001, t0);
    ngain.gain.exponentialRampToValueAtTime(0.3, t0 + dur * 0.9);
    ngain.gain.linearRampToValueAtTime(0, t0 + dur + 0.1);
    src.connect(filter).connect(ngain).connect(out);
    src.start(t0);
    src.stop(t0 + dur + 0.1);
  },
  heartbeat(c, out) {
    const thump = (start, dur, peak) => tone(c, out, { freq: 55, freqEnd: 33, duration: dur, peak, start });
    thump(0, 0.18, 0.7);
    thump(0.18, 0.14, 0.45);
    thump(0.9, 0.18, 0.7);
    thump(1.08, 0.14, 0.45);
  },
  success_ding(c, out) {
    tone(c, out, { freq: 1568, duration: 0.5, peak: 0.5 });
    tone(c, out, { freq: 2093, start: 0.03, duration: 0.4, peak: 0.25 });
  },
  party_horn(c, out) {
    const dur = 0.6;
    const t0 = c.currentTime;
    const osc = c.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, t0);
    osc.frequency.linearRampToValueAtTime(340, t0 + dur);
    const vibrato = c.createOscillator();
    vibrato.frequency.value = 22;
    const vibratoGain = c.createGain();
    vibratoGain.gain.value = 18;
    vibrato.connect(vibratoGain).connect(osc.frequency);
    const gain = c.createGain();
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(0.5, t0 + 0.03);
    gain.gain.setValueAtTime(0.5, t0 + dur * 0.7);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain).connect(out);
    vibrato.start(t0);
    osc.start(t0);
    vibrato.stop(t0 + dur + 0.05);
    osc.stop(t0 + dur + 0.05);
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

// how much of each effect's signal also feeds the reverb bus, for a sense
// of space on the bigger/ceremonial sounds - the punchier ones stay dry
const REVERB_SEND = {
  gong: 0.4,
  bell_toll: 0.45,
  crown_fanfare: 0.3,
  fanfare: 0.15,
  riser: 0.2,
  chime: 0.15
};

export function playSoundEffect(key, volumePercent = 70) {
  if (typeof window === 'undefined') return;
  const fn = EFFECTS[key];
  if (!fn) return;

  const c = ctx();
  if (c.state === 'suspended') c.resume();

  const master = c.createGain();
  master.gain.value = Math.max(0, Math.min(1, volumePercent / 100));
  master.connect(getCompressor(c));

  const wetAmount = REVERB_SEND[key];
  if (wetAmount) {
    const wet = c.createGain();
    wet.gain.value = wetAmount;
    master.connect(wet);
    wet.connect(getReverbBus(c));
  }

  fn(c, master);
}
