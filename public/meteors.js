// 背景流星：画在地球后面的全屏 canvas
const canvas = document.getElementById('meteors');
const g = canvas.getContext('2d');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const meteors = [];
let W = 0;
let H = 0;
let last = performance.now();
let cooldown = 1;

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  W = window.innerWidth;
  H = window.innerHeight;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener('resize', resize);
resize();

function spawn() {
  const angle = (25 + Math.random() * 20) * Math.PI / 180;
  const speed = 600 + Math.random() * 700;
  meteors.push({
    x: W * (0.2 + Math.random() * 1.0),
    y: H * (-0.1 + Math.random() * 0.45),
    vx: -Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    len: 120 + Math.random() * 180,
    width: 1 + Math.random() * 1.5,
    life: 0,
    ttl: 0.9 + Math.random() * 0.9,
  });
}

function frame(now) {
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;
  cooldown -= dt;
  if (cooldown <= 0) {
    spawn();
    if (Math.random() < 0.15) spawn();
    cooldown = reduced ? 6 + Math.random() * 6 : 0.8 + Math.random() * 2.2;
  }

  g.clearRect(0, 0, W, H);
  for (let i = meteors.length - 1; i >= 0; i--) {
    const m = meteors[i];
    m.life += dt;
    m.x += m.vx * dt;
    m.y += m.vy * dt;
    if (m.life > m.ttl) {
      meteors.splice(i, 1);
      continue;
    }
    const alpha = Math.sin(Math.PI * m.life / m.ttl);
    const k = m.len / Math.hypot(m.vx, m.vy);
    const tx = m.x - m.vx * k;
    const ty = m.y - m.vy * k;
    const grad = g.createLinearGradient(m.x, m.y, tx, ty);
    grad.addColorStop(0, `rgba(255,255,255,${alpha})`);
    grad.addColorStop(0.3, `rgba(189,224,254,${alpha * 0.5})`);
    grad.addColorStop(1, 'rgba(189,224,254,0)');
    g.strokeStyle = grad;
    g.lineWidth = m.width;
    g.lineCap = 'round';
    g.beginPath();
    g.moveTo(m.x, m.y);
    g.lineTo(tx, ty);
    g.stroke();
    g.fillStyle = `rgba(255,255,255,${alpha})`;
    g.shadowColor = '#bde0fe';
    g.shadowBlur = 12;
    g.beginPath();
    g.arc(m.x, m.y, m.width * 1.2, 0, Math.PI * 2);
    g.fill();
    g.shadowBlur = 0;
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
