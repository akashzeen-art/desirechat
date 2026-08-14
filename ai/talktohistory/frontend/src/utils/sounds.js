/** Tiny Web Audio sounds — no audio files needed */

let ctx;

function getCtx() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

function tone(freq, duration = 0.08, type = "sine", gain = 0.04) {
  const audio = getCtx();
  if (!audio) return;
  const osc = audio.createOscillator();
  const g = audio.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.value = gain;
  osc.connect(g);
  g.connect(audio.destination);
  const now = audio.currentTime;
  g.gain.setValueAtTime(gain, now);
  g.gain.exponentialRampToValueAtTime(0.001, now + duration);
  osc.start(now);
  osc.stop(now + duration);
}

export function playSendSound() {
  tone(520, 0.06, "triangle", 0.035);
  setTimeout(() => tone(680, 0.07, "triangle", 0.03), 40);
}

export function playReceiveSound() {
  tone(420, 0.07, "sine", 0.03);
  setTimeout(() => tone(560, 0.09, "sine", 0.035), 50);
}

export function playTypingSound() {}

export function playReactSound() {
  tone(640, 0.05, "sine", 0.04);
  setTimeout(() => tone(820, 0.08, "sine", 0.03), 45);
}

export function playPopSound() {
  tone(700, 0.05, "triangle", 0.04);
}
