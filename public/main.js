// 足迹 / 项目地点：按需修改
const PLACES = [
  { name: '成都', lat: 30.5728, lng: 104.0668, desc: '常驻城市', home: true },
  { name: '北京', lat: 39.9042, lng: 116.4074, desc: '项目合作' },
  { name: '呼和浩特', lat: 40.8424, lng: 111.7490, desc: '野外测绘项目' },
  { name: '乌鲁木齐', lat: 43.8256, lng: 87.6168, desc: '遥感影像解译' },
  { name: '拉萨', lat: 29.6520, lng: 91.1721, desc: '高原地形测绘' },
  { name: '上海', lat: 31.2304, lng: 121.4737, desc: 'WebGIS 平台开发' },
  { name: '广州', lat: 23.1291, lng: 113.2644, desc: '城市三维建模' },
];

const COUNTRIES_URL = 'https://cdn.jsdelivr.net/npm/globe.gl@2.46.2/example/datasets/ne_110m_admin_0_countries.geojson';
const OCEAN = '#5ec8f2';
const OUTLINE = '#1d3557';
const PALETTE = ['#a8e6a1', '#ffe28a', '#ffb5a7', '#c3b1e1', '#9be7c4', '#ffd6a5', '#bde0fe', '#fcbad3'];
const CHINA_COLOR = '#ff8fa3';

const home = PLACES.find(p => p.home) || PLACES[0];
const el = document.getElementById('globe');

const hash = s => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
const countryColor = f => {
  const { ISO_A3, ADM0_A3, ADMIN = '' } = f.properties;
  const code = ISO_A3 !== '-99' ? ISO_A3 : ADM0_A3;
  if (code === 'CHN' || code === 'TWN') return CHINA_COLOR;
  if (code === 'ATA') return '#f8fbff';
  return PALETTE[hash(ADMIN) % PALETTE.length];
};

let hovered = null;

const globe = new Globe(el)
  .backgroundColor('rgba(0,0,0,0)')
  .showAtmosphere(true)
  .atmosphereColor('#bde0fe')
  .atmosphereAltitude(0.18)
  .showGraticules(true)
  // 卡通国家板块
  .polygonSideColor(() => 'rgba(29,53,87,0.35)')
  .polygonStrokeColor(() => OUTLINE)
  .polygonsTransitionDuration(250)
  .polygonLabel(f => `<div class="tooltip" style="opacity:1;position:static"><b>${f.properties.ADMIN}</b></div>`)
  .onPolygonHover(f => {
    hovered = f;
    applyHover();
  })
  // 地点
  .pointsData(PLACES)
  .pointLat('lat')
  .pointLng('lng')
  .pointAltitude(d => (d.home ? 0.1 : 0.05))
  .pointRadius(d => (d.home ? 0.7 : 0.45))
  .pointColor(d => (d.home ? '#ff4d6d' : '#ffffff'))
  .pointLabel(d => `<div class="tooltip" style="opacity:1;position:static"><b>${d.name}</b><br/><small>${d.desc}<br/>${d.lat.toFixed(4)}°, ${d.lng.toFixed(4)}°</small></div>`)
  .onPointClick(d => globe.pointOfView({ lat: d.lat, lng: d.lng, altitude: 0.9 }, 1500))
  // 从常驻地飞向各项目点的弧线
  .arcsData(PLACES.filter(p => p !== home).map(p => ({
    startLat: home.lat, startLng: home.lng, endLat: p.lat, endLng: p.lng,
  })))
  .arcColor(() => ['#ff4d6d', '#ffd166'])
  .arcStroke(0.7)
  .arcDashLength(0.4)
  .arcDashGap(0.2)
  .arcDashAnimateTime(2500)
  // 常驻地波纹
  .ringsData([home])
  .ringColor(() => t => `rgba(255,77,109,${1 - t})`)
  .ringMaxRadius(4)
  .ringPropagationSpeed(2)
  .ringRepeatPeriod(1200);

function applyHover() {
  globe
    .polygonCapColor(f => (f === hovered ? '#fff3b0' : countryColor(f)))
    .polygonAltitude(f => (f === hovered ? 0.035 : 0.012));
}
applyHover();

globe.globeMaterial().color.set(OCEAN);
globe.globeMaterial().shininess = 0;

fetch(COUNTRIES_URL)
  .then(r => r.json())
  .then(geo => globe.polygonsData(geo.features));

// 桌面端把地球往右挪，避免被名片遮挡
function layout() {
  globe.width(window.innerWidth).height(window.innerHeight);
  const card = document.getElementById('card');
  const desktop = window.innerWidth > 720 && !card.classList.contains('collapsed');
  if (typeof globe.globeOffset === 'function') {
    globe.globeOffset(desktop ? [Math.min(220, window.innerWidth * 0.15), 0] : [0, 0]);
  }
}
window.addEventListener('resize', layout);
layout();

// 开场故事结束后从远处飞向常驻地
globe.pointOfView({ lat: home.lat - 10, lng: home.lng - 60, altitude: 4 });
window.addEventListener('intro:end', () => {
  globe.pointOfView({ lat: home.lat - 10, lng: home.lng - 60, altitude: 4 });
  globe.pointOfView({ lat: 25, lng: home.lng, altitude: 2.2 }, 2800);
});

// 自动旋转；用户拖动时暂停，松手 3 秒后恢复
const controls = globe.controls();
controls.autoRotate = true;
controls.autoRotateSpeed = 0.5;
controls.enableDamping = true;
controls.minDistance = 120;
controls.maxDistance = 800;

let resumeTimer;
controls.addEventListener('start', () => {
  controls.autoRotate = false;
  clearTimeout(resumeTimer);
});
controls.addEventListener('end', () => {
  resumeTimer = setTimeout(() => (controls.autoRotate = true), 3000);
});

// 鼠标处经纬度读数
const coordsEl = document.getElementById('coords');
const fmt = (v, pos, neg) => `${Math.abs(v).toFixed(4)}°${v >= 0 ? pos : neg}`;
el.addEventListener('mousemove', e => {
  const c = globe.toGlobeCoords(e.clientX, e.clientY);
  coordsEl.textContent = c ? `${fmt(c.lat, 'N', 'S')}  ${fmt(c.lng, 'E', 'W')}` : 'LAT —  LNG —';
});

// 抖音：点击复制抖音号
const douyinBtn = document.getElementById('douyin');
douyinBtn.addEventListener('click', async () => {
  const id = douyinBtn.dataset.id;
  try {
    await navigator.clipboard.writeText(id);
    douyinBtn.textContent = `已复制 ${id}`;
  } catch {
    douyinBtn.textContent = `抖音号 ${id}`;
  }
  setTimeout(() => (douyinBtn.textContent = '♪ 抖音'), 2500);
});

// 收起 / 展开名片
document.getElementById('toggle').addEventListener('click', () => {
  document.getElementById('card').classList.toggle('collapsed');
  layout();
});
