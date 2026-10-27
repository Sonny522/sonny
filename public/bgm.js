// 舒缓背景音乐：Web Audio 实时合成的氛围 Pad + 随机风铃，无需音频文件
const BAR = 8;
const CHORDS = [[48, 55, 64, 71], [45, 52, 60, 67], [41, 48, 57, 64], [43, 50, 59, 64]]; // Cmaj7 Am7 Fmaj7 G6
const BELLS = [72, 74, 76, 79, 81, 84];
const freq = m => 440 * 2 ** ((m - 69) / 12);

const musicBtn = document.getElementById('music');
let ctx, master, bus, loop;
let bar = 0;
let nextTime = 0;
let playing = false;

function init() {
  ctx = new (window.AudioContext || window.webkitAudioContext)();
  master = ctx.createGain();
  master.gain.value = 0;
  bus = ctx.createBiquadFilter();
  bus.type = 'lowpass';
  bus.frequency.value = 1800;
  const delay = ctx.createDelay();
  delay.delayTime.value = 0.45;
  const feedback = ctx.createGain();
  feedback.gain.value = 0.35;
  delay.connect(feedback).connect(delay);
  bus.connect(master);
  bus.connect(delay);
  delay.connect(master);
  master.connect(ctx.destination);
}

function tone(midi, start, dur, { type = 'sine', vol = 0.035, attack = 2, release = 3 } = {}) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq(midi);
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(vol, start + attack);
  gain.gain.setValueAtTime(vol, start + dur);
  gain.gain.linearRampToValueAtTime(0, start + dur + release);
  osc.connect(gain).connect(bus);
  osc.start(start);
  osc.stop(start + dur + release + 0.1);
}

function schedule() {
  while (nextTime < ctx.currentTime + 1) {
    CHORDS[bar % CHORDS.length].forEach(m => {
      tone(m, nextTime, BAR - 2);
      tone(m + 12, nextTime, BAR - 2, { type: 'triangle', vol: 0.008 });
    });
    for (let i = 0; i < 4; i++) {
      if (Math.random() < 0.7) {
        const note = BELLS[Math.floor(Math.random() * BELLS.length)];
        tone(note, nextTime + i * 2 + Math.random(), 0.05, { vol: 0.025, attack: 0.01, release: 2.5 });
      }
    }
    nextTime += BAR;
    bar++;
  }
}

function setPlaying(on) {
  playing = on;
  localStorage.setItem('bgm', on ? 'on' : 'off');
  musicBtn.classList.toggle('on', on);
  musicBtn.title = on ? '关闭背景音乐' : '播放背景音乐';
  if (on) {
    if (!ctx) init();
    ctx.resume();
    nextTime = Math.max(nextTime, ctx.currentTime + 0.1);
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.linearRampToValueAtTime(0.8, ctx.currentTime + 2);
    schedule();
    loop = setInterval(schedule, 500);
  } else if (ctx) {
    clearInterval(loop);
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.linearRampToValueAtTime(0, ctx.currentTime + 1);
    setTimeout(() => !playing && ctx.suspend(), 1100);
  }
}

musicBtn.addEventListener('click', () => setPlaying(!playing));

// 浏览器要求用户交互后才能出声：首次点击 / 按键时自动开始（除非之前关掉过）
function firstGesture(e) {
  if (e.target === musicBtn) return;
  document.removeEventListener('pointerdown', firstGesture);
  document.removeEventListener('keydown', firstGesture);
  if (!playing && localStorage.getItem('bgm') !== 'off') setPlaying(true);
}
document.addEventListener('pointerdown', firstGesture);
document.addEventListener('keydown', firstGesture);
