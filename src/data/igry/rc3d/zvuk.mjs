// rc3d · Звук Web Audio без файлов + голос из mp3. Вынесено из Р-7 (рёв по тяге, хлопок, удар ферм, грохот, сигнал).
// Непрерывные «каналы» с уровнем 0…1: roar (рёв двигателя), hiss (шипение пара), hum (гул машин), wind (ветер).
// Разовые звуки: pop, hit, boom, signal, whoosh, crack (хлопок ткани), alarm, click, bell.
// Браузер разрешает звук только после действия человека: контекст оживает по первому клику (resume()).
let AC = null, noiseBuf = null;
const bufs = {};   // голос: адрес → AudioBuffer (общий для заставки и игры)

function ctx() {
  if (AC) return AC;
  const C = window.AudioContext || window.webkitAudioContext; if (!C) return null;
  AC = new C();
  const len = AC.sampleRate * 3, b = AC.createBuffer(1, len, AC.sampleRate), ch = b.getChannelData(0); let last = 0;
  for (let i = 0; i < len; i++) { const w = Math.random() * 2 - 1; last = (last + 0.02 * w) / 1.02; ch[i] = last * 3.5 + w * 0.08; }   // «коричневый» шум с шорохом
  noiseBuf = b;
  return AC;
}

export class Zvuk {
  constructor({ muted = false } = {}) { this.on = !muted; this.lvl = {}; this.goal = {}; this.ready = false; }
  // Создаёт цепочки. Можно звать заранее (контекст «спит»), чтобы голоса успели загрузиться.
  init() {
    if (this.ready) { if (AC.state === 'suspended') AC.resume(); return; }
    const A = ctx(); if (!A) return;
    this.ready = true;
    this.master = A.createGain(); this.master.gain.value = this.on ? 0.8 : 0; this.master.connect(A.destination);
    if (window.__recAudio) {   // автотест: дорожка для записи видео со звуком
      if (!window.__audioDest) { window.__audioDest = A.createMediaStreamDestination(); window.__audioStream = window.__audioDest.stream; }
      this.master.connect(window.__audioDest);
    }
    const noise = (type, f, q) => { const s = A.createBufferSource(); s.buffer = noiseBuf; s.loop = true; const fl = A.createBiquadFilter(); fl.type = type; fl.frequency.value = f; fl.Q.value = q; const g = A.createGain(); g.gain.value = 0; s.connect(fl).connect(g).connect(this.master); s.start(0, Math.random() * 2); return { g, f: fl }; };
    this.ch = {
      roar: noise('lowpass', 300, 0.7),
      hiss: noise('highpass', 2500, 0.5),
      wind: noise('bandpass', 500, 0.6),
      hum: (() => { const o = A.createOscillator(); o.type = 'sawtooth'; o.frequency.value = 50; const f = A.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 160; const g = A.createGain(); g.gain.value = 0; o.connect(f).connect(g).connect(this.master); o.start(); return { g, f }; })(),
    };
    const sub = A.createOscillator(); sub.type = 'sawtooth'; sub.frequency.value = 38;   // низ под рёвом двигателя
    const sf = A.createBiquadFilter(); sf.type = 'lowpass'; sf.frequency.value = 90;
    this.subG = A.createGain(); this.subG.gain.value = 0; sub.connect(sf).connect(this.subG).connect(this.master); sub.start();
    for (const k of Object.keys(this.ch)) { this.lvl[k] = 0; this.goal[k] = this.goal[k] || 0; }
  }
  resume() { this.init(); if (AC && AC.state === 'suspended') AC.resume(); }
  setOn(on) { this.on = on; if (this.master) this.master.gain.setTargetAtTime(on ? 0.8 : 0, AC.currentTime, 0.05); }
  level(kind, l) { this.goal[kind] = l; }
  silence() { for (const k of Object.keys(this.goal)) this.goal[k] = 0; }
  // Каждый кадр: каналы плавно идут к заданному уровню; у рёва и ветра «дышит» тембр.
  tick() {
    if (!this.ready) return;
    const now = AC.currentTime;
    for (const [k, c] of Object.entries(this.ch)) {
      const L = (this.lvl[k] += ((this.goal[k] || 0) - this.lvl[k]) * 0.08);
      const g = { roar: 1.1, hiss: 0.35, wind: 0.6, hum: 0.25 }[k];
      c.g.gain.setTargetAtTime(L * g, now, 0.05);
      if (k === 'roar') { c.f.frequency.setTargetAtTime(220 + L * 900 + Math.random() * 60 * L, now, 0.05); this.subG.gain.setTargetAtTime(L * 0.35, now, 0.05); }
      if (k === 'wind') c.f.frequency.setTargetAtTime(350 + 500 * L + Math.random() * 120, now, 0.1);
    }
  }
  burst({ dur = 1.5, gain = 1, f0 = 1200, f1 = 120, q = 0.8, delay = 0, type = 'lowpass' }) {
    if (!this.ready) return; const t = AC.currentTime + delay;
    const s = AC.createBufferSource(); s.buffer = noiseBuf; s.playbackRate.value = 0.8 + Math.random() * 0.4;
    const f = AC.createBiquadFilter(); f.type = type; f.Q.value = q; f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(f1, t + dur);
    const g = AC.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f).connect(g).connect(this.master); s.start(t, Math.random() * 1.5); s.stop(t + dur + 0.1);
  }
  tones(list, wave = 'sine', len = 1.6, gain = 0.35) {
    if (!this.ready) return; const t = AC.currentTime;
    for (const [fr, d, g0] of list) {
      const o = AC.createOscillator(); o.type = wave; o.frequency.value = fr;
      const g = AC.createGain(); g.gain.setValueAtTime(0.0001, t + d); g.gain.exponentialRampToValueAtTime(g0 ?? gain, t + d + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + d + len);
      o.connect(g).connect(this.master); o.start(t + d); o.stop(t + d + len + 0.1);
    }
  }
  play(kind, k = 1) {
    if (!this.ready) return;
    switch (kind) {
      case 'pop': this.burst({ dur: 0.5, gain: 0.8 * k, f0: 3500, f1: 300 }); break;
      case 'hit': this.tones([[180, 0, 0.5 * k], [413, 0, 0.3 * k], [767, 0, 0.18 * k]], 'triangle', 1.1); this.burst({ dur: 0.35, gain: 0.6 * k, f0: 2500, f1: 300 }); break;
      case 'boom': this.burst({ dur: 3 + 1.5 * k, gain: 1.1 * k, f0: 1800, f1: 60 }); this.burst({ dur: 0.5, gain: 0.9, f0: 4000, f1: 400 }); break;
      case 'signal': this.tones([[659, 0], [880, 0.18], [1319, 0.36]].map(([f, d]) => [f, d, 0.35 * k])); break;
      case 'bell': this.tones([[523, 0, 0.4 * k], [1046, 0, 0.12 * k], [1568, 0, 0.06 * k]], 'sine', 2.4); break;
      case 'alarm': this.tones([[440, 0, 0.18 * k], [330, 0.32, 0.18 * k], [440, 0.64, 0.18 * k], [330, 0.96, 0.18 * k]], 'square', 0.28); break;
      case 'click': this.burst({ dur: 0.06, gain: 0.5 * k, f0: 6000, f1: 2000, type: 'highpass' }); break;
      case 'whoosh': this.burst({ dur: 1.2, gain: 0.7 * k, f0: 300, f1: 2500, q: 2, type: 'bandpass' }); break;
      case 'crack': this.burst({ dur: 0.25, gain: 1 * k, f0: 5000, f1: 700, type: 'bandpass', q: 0.6 }); this.burst({ dur: 0.5, gain: 0.5 * k, f0: 900, f1: 120, delay: 0.03 }); break;
      case 'applause': for (let i = 0; i < 60; i++) this.burst({ dur: 0.05, gain: (0.15 + Math.random() * 0.25) * k, f0: 3000 + Math.random() * 3000, f1: 1500, type: 'bandpass', q: 1.2, delay: Math.random() * 2.2 }); break;
      case 'creak': this.tones([[140, 0, 0.12 * k], [190, 0.12, 0.1 * k], [120, 0.25, 0.1 * k]], 'sawtooth', 0.3); break;
      case 'knock': this.tones([[90, 0, 0.5 * k], [180, 0, 0.15 * k]], 'sine', 0.25); this.burst({ dur: 0.12, gain: 0.35 * k, f0: 1200, f1: 200 }); break;
      case 'drip': this.tones([[1400 + Math.random() * 500, 0, 0.18 * k]], 'sine', 0.15); break;
      default: break;
    }
  }
  // Голос: файл mp3 (уже обработан «громкой связью» при подготовке); radio:true — ещё и полоса 300–3400 Гц на лету.
  async load(url) {
    if (bufs[url]) return bufs[url];
    const A = ctx(); if (!A) return null;
    bufs[url] = fetch(url).then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(r.status))).then((a) => A.decodeAudioData(a)).then((b) => (bufs[url] = b)).catch(() => (bufs[url] = null));
    return bufs[url];
  }
  voice(url, { radio = false, gain = 1.3 } = {}) {
    const b = bufs[url]; if (!this.ready || !b || b instanceof Promise) return 0;
    const s = AC.createBufferSource(); s.buffer = b; let n = s;
    if (radio) { const h = AC.createBiquadFilter(); h.type = 'highpass'; h.frequency.value = 320; const l = AC.createBiquadFilter(); l.type = 'lowpass'; l.frequency.value = 3400; n.connect(h); h.connect(l); n = l; }
    const g = AC.createGain(); g.gain.value = gain; n.connect(g).connect(this.master); s.start();
    return b.duration;
  }
}
