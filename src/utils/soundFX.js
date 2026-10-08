// src/utils/soundFX.js

// Shared AudioContext instance (lazy initialization)
let audioCtx = null;
let isMuted = false;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

export const toggleMute = () => {
  isMuted = !isMuted;
  return isMuted;
};

export const getMuteStatus = () => isMuted;

// 1. Sliding Tile Movement Click
export const playTileSlideSound = () => {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "triangle";
  osc.frequency.setValueAtTime(350, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.05);

  gain.gain.setValueAtTime(0.2, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.05);
};

// 2. Tic Tac Toe Player Moves ('X' High Tap / 'O' Low Tap)
export const playMoveSound = (type = "X") => {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  const freq = type === "X" ? 520 : 380;
  osc.type = "sine";
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(freq * 1.3, ctx.currentTime + 0.08);

  gain.gain.setValueAtTime(0.2, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.08);
};

// 3. Authentic Dice Roll Sound (Clean Trimmed Start & End)
let diceAudioInstance = null;
let diceStopTimer = null;

export const playDiceRollSound = () => {
  if (isMuted) return;
  try {
    if (!diceAudioInstance) {
      diceAudioInstance = new Audio("/diceroll.mp3");
    }

    if (diceStopTimer) {
      clearTimeout(diceStopTimer);
    }

    diceAudioInstance.currentTime = 0.15; 
    diceAudioInstance.volume = 0.85;

    diceAudioInstance.play().catch((err) => {
      console.warn("Audio play prevented:", err);
    });
    diceStopTimer = setTimeout(() => {
      if (diceAudioInstance) {
        diceAudioInstance.pause();
        diceAudioInstance.currentTime = 0;
      }
    }, 550);

  } catch (error) {
    console.error("Dice audio playback error:", error);
  }
};

// 4. Retro Victory Melodic Chime (Win)
export const playWinSound = () => {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);

    gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.1);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.1 + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime + idx * 0.1);
    osc.stop(ctx.currentTime + idx * 0.1 + 0.25);
  });
};

// 5. Retro Defeat / Lose Buzz
export const playLoseSound = () => {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const notes = [380, 320, 260, 200];
  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);

    gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.1);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.1 + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime + idx * 0.1);
    osc.stop(ctx.currentTime + idx * 0.1 + 0.18);
  });
};

// 6. Ludo 6 Special Bonus Audio (High-pitch Exciting Ding Chime)
export const playBonusSixSound = () => {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const notes = [880, 1318.51, 1760]; // A5, E6, A6 (Magic spark chime)
  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    const startTime = ctx.currentTime + idx * 0.05;

    osc.frequency.setValueAtTime(freq, startTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.1, startTime + 0.1);

    gain.gain.setValueAtTime(0.2, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.14);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + 0.15);
  });
};
// 7. RPS Tie / Draw Sound (Soft Neutral Bounce Beep)
export const playTieSound = () => {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const notes = [440, 440]; // A4, A4 (neutral bounce)
  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    const startTime = ctx.currentTime + idx * 0.09;

    osc.frequency.setValueAtTime(freq, startTime);
    osc.frequency.exponentialRampToValueAtTime(320, startTime + 0.06);

    gain.gain.setValueAtTime(0.14, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.06);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + 0.07);
  });
};