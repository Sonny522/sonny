const SLIDES = [
  { lines: ['孩童时期，', '我常常对着<em>地球仪</em>', '久久发呆。'] },
  { scene: 'wonder', caption: '总在好奇：' },
  { lines: ['在这个星球<em>遥远的别处</em>，', '人们正过着', '怎样<em>寻常的生活</em>。'] },
  { scene: 'seed', caption: '那些藏在<em>经纬线</em>里的远方，<br/>在心底埋下了<em>种子</em>。' },
  { lines: ['长大后，', '我如愿成为一名', '<em>地理信息技术人员</em>，'] },
  { lines: ['得以用<em>测绘、GIS</em> 的方式，', '读懂这片大地，'] },
  { lines: ['奔赴年少时', '望向世界的<em>好奇</em>。'] },
];

const intro = document.getElementById('intro');
const textEl = document.getElementById('introText');
const sceneEl = document.getElementById('introScene');
const captionEl = document.getElementById('introCaption');
const progressEl = document.getElementById('introProgress');

const FADE_OUT = 700;
const duration = s => (s.scene ? 5200 : 2400 + s.lines.length * 700);

let index = -1;
let timer;
let busy = false;

function renderProgress() {
  progressEl.innerHTML = SLIDES.map((s, k) => {
    const cls = k < index ? 'done' : k === index ? 'active' : '';
    return `<span class="bar ${cls}" style="--dur:${duration(s)}ms"><i></i></span>`;
  }).join('');
}

function show(n) {
  index = n;
  if (n >= SLIDES.length) return finish();
  const s = SLIDES[n];
  if (s.scene) {
    sceneEl.dataset.variant = s.scene;
    captionEl.innerHTML = s.caption;
  } else {
    textEl.innerHTML = s.lines.map((l, k) => `<p class="line" style="--d:${k * 0.35}s">${l}</p>`).join('');
  }
  renderProgress();
  requestAnimationFrame(() => requestAnimationFrame(() => (s.scene ? sceneEl : textEl).classList.add('show')));
  timer = setTimeout(next, duration(s));
}

function next() {
  if (busy || index >= SLIDES.length) return;
  busy = true;
  clearTimeout(timer);
  textEl.classList.remove('show');
  sceneEl.classList.remove('show');
  setTimeout(() => {
    busy = false;
    show(index + 1);
  }, FADE_OUT);
}

function finish() {
  clearTimeout(timer);
  index = SLIDES.length;
  textEl.classList.remove('show');
  sceneEl.classList.remove('show');
  intro.classList.add('leaving');
  document.body.classList.remove('intro-active');
  window.dispatchEvent(new Event('intro:end'));
  setTimeout(() => (intro.hidden = true), 1200);
}

function start() {
  clearTimeout(timer);
  busy = false;
  intro.hidden = false;
  intro.classList.remove('leaving');
  document.body.classList.add('intro-active');
  show(0);
}

intro.addEventListener('click', e => {
  if (e.target.id === 'introSkip') return finish();
  next();
});
document.addEventListener('keydown', e => {
  if (intro.hidden || index >= SLIDES.length) return;
  if (e.key === 'Escape') finish();
  else if (e.key === ' ' || e.key === 'ArrowRight' || e.key === 'Enter') {
    e.preventDefault();
    next();
  }
});
document.getElementById('replay').addEventListener('click', start);

start();
