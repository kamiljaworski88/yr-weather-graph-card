/**
 * yr-weather-graph-card  v2.2
 * Custom Lovelace card dla Home Assistant
 * Dane pogodowe : api.met.no Locationforecast 2.0
 * Geocoding     : Nominatim (OpenStreetMap) – bez klucza API
 *
 * Instalacja:
 *   type: custom:yr-weather-graph-card
 *   location_name: "Brzeziny"
 *   lat: 51.8018
 *   lon: 19.7515
 *   hours: 72
 *   refresh_interval: 1800
 *   theme: dark        # dark (domyślny) lub light
 */

// ═══════════════════════════════════════════════════════════
// STAŁE
// ═══════════════════════════════════════════════════════════
const MET_API       = 'https://api.met.no/weatherapi/locationforecast/2.0/compact';
const NOMINATIM_API = 'https://nominatim.openstreetmap.org/search';
const UA            = 'HomeAssistant/YrWeatherGraphCard/2.2';

const SYMBOL_MAP = {
  clearsky:'☀️', fair:'🌤️', partlycloudy:'⛅', cloudy:'☁️', fog:'🌫️',
  lightrain:'🌦️', rain:'🌧️', heavyrain:'🌧️',
  lightrainshowers:'🌦️', rainshowers:'🌦️', heavyrainshowers:'🌧️',
  lightsleet:'🌨️', sleet:'🌨️', heavysleet:'🌨️',
  lightsnow:'🌨️', snow:'❄️', heavysnow:'❄️',
  thunder:'⛈️', lightrainandthunder:'⛈️', rainandthunder:'⛈️', snowandthunder:'⛈️',
};

function symEmoji(code) {
  if (!code) return '🌡️';
  return SYMBOL_MAP[code.replace(/_day$|_night$|_polartwilight$/, '')] || '🌡️';
}
function windDir(deg) {
  return ['N','NE','E','SE','S','SW','W','NW'][Math.round(deg / 45) % 8];
}

// ═══════════════════════════════════════════════════════════
// DEFINICJE MOTYWÓW
// ═══════════════════════════════════════════════════════════

// Kolory SVG (nie można zastąpić CSS vars wewnątrz SVG attr)
const GRAPH_THEME = {
  dark: {
    bg1: '#0f172a', bg2: '#1e293b',
    tempLine: '#fbbf24', tempFill: '#fbbf24',
    fillOp0: '0.35', fillOp1: '0.03',
    tempLabel: '#fde68a',
    precipBar: 'rgba(99,179,237,0.65)',
    axisText: 'rgba(200,220,255,0.7)',
    gridDay: 'rgba(255,255,255,0.18)', gridHour: 'rgba(255,255,255,0.06)',
    gridH: 'rgba(255,255,255,0.07)',
    xDay: '#93c5fd', xHour: 'rgba(180,200,230,0.7)',
    legend: 'rgba(180,200,230,0.7)',
  },
  light: {
    bg1: '#f1f5f9', bg2: '#e8edf5',
    tempLine: '#d97706', tempFill: '#f59e0b',
    fillOp0: '0.28', fillOp1: '0.02',
    tempLabel: '#92400e',
    precipBar: 'rgba(37,99,235,0.5)',
    axisText: 'rgba(30,41,59,0.6)',
    gridDay: 'rgba(0,0,0,0.12)', gridHour: 'rgba(0,0,0,0.05)',
    gridH: 'rgba(0,0,0,0.06)',
    xDay: '#1d4ed8', xHour: 'rgba(71,85,105,0.75)',
    legend: 'rgba(71,85,105,0.8)',
  },
};

// CSS custom properties wstrzykiwane do :host
const THEME_VARS = {
  dark: `
    --c-bg:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);
    --c-text:#e2e8f0; --c-text2:#94a3b8; --c-text3:#475569;
    --c-name:#f1f5f9; --c-temp:#fde68a; --c-tmin:#93c5fd;
    --c-blue:#93c5fd; --c-blue2:rgba(99,179,237,.7);
    --c-rain:#63b3ed; --c-rain2:#3b82f6; --c-dry:#334155;
    --c-hum:#7dd3fc; --c-border:rgba(255,255,255,.07);
    --c-border2:rgba(255,255,255,.06); --c-shadow:rgba(0,0,0,.45);
    --c-head-bg:rgba(255,255,255,.025); --c-head-hover:rgba(255,255,255,.055);
    --c-rain-border:rgba(99,179,237,.7); --c-body-bg:rgba(0,0,0,.15);
    --c-row-border:rgba(255,255,255,.04); --c-bar-bg:rgba(255,255,255,.07);
    --c-rain-empty:rgba(148,163,184,.3); --c-footer:rgba(148,163,184,.6);
    --c-footer-border:rgba(255,255,255,.05); --c-link:rgba(99,179,237,.7);
    --c-btn-hover:rgba(255,255,255,.06); --c-sep:#475569;
    --c-spin1:#1e40af; --c-spin2:#93c5fd;
    --c-detail-border:rgba(255,255,255,.05); --c-detail-title:#475569;
    --c-hh-border:#3b82f6; --c-row-rainy:rgba(59,130,246,.08);
    --c-row-heavy:rgba(59,130,246,.18);
  `,
  light: `
    --c-bg:linear-gradient(135deg,#f8fafc 0%,#e2e8f0 100%);
    --c-text:#1e293b; --c-text2:#64748b; --c-text3:#94a3b8;
    --c-name:#0f172a; --c-temp:#d97706; --c-tmin:#2563eb;
    --c-blue:#2563eb; --c-blue2:rgba(37,99,235,.8);
    --c-rain:#1d4ed8; --c-rain2:#2563eb; --c-dry:#cbd5e1;
    --c-hum:#1d4ed8; --c-border:rgba(0,0,0,.1);
    --c-border2:rgba(0,0,0,.08); --c-shadow:rgba(0,0,0,.12);
    --c-head-bg:rgba(0,0,0,.02); --c-head-hover:rgba(0,0,0,.05);
    --c-rain-border:rgba(37,99,235,.7); --c-body-bg:rgba(0,0,0,.03);
    --c-row-border:rgba(0,0,0,.05); --c-bar-bg:rgba(0,0,0,.08);
    --c-rain-empty:rgba(148,163,184,.5); --c-footer:rgba(100,116,139,.7);
    --c-footer-border:rgba(0,0,0,.08); --c-link:#2563eb;
    --c-btn-hover:rgba(0,0,0,.06); --c-sep:#94a3b8;
    --c-spin1:#bfdbfe; --c-spin2:#3b82f6;
    --c-detail-border:rgba(0,0,0,.07); --c-detail-title:#94a3b8;
    --c-hh-border:#2563eb; --c-row-rainy:rgba(59,130,246,.07);
    --c-row-heavy:rgba(59,130,246,.16);
  `,
};

// ═══════════════════════════════════════════════════════════
// SVG GRAF
// ═══════════════════════════════════════════════════════════
function buildGraph(hourlyData, gt) {
  const W = 900, H = 320;
  const PAD = { top: 55, right: 20, bottom: 60, left: 42 };
  const GW = W - PAD.left - PAD.right;
  const GH = H - PAD.top  - PAD.bottom;
  const N  = hourlyData.length;
  if (N < 2) return '<div class="error">Za mało danych</div>';

  const temps   = hourlyData.map(d => d.temp);
  const precips = hourlyData.map(d => d.precip);
  const tMin = Math.floor(Math.min(...temps)) - 1;
  const tMax = Math.ceil(Math.max(...temps))  + 2;
  const pMax = Math.max(Math.max(...precips), 2);

  const xS = i => PAD.left + (i / (N - 1)) * GW;
  const yT = t => PAD.top + GH - ((t - tMin) / (tMax - tMin)) * GH;

  const tempLine = hourlyData.map((d,i) => `${xS(i).toFixed(1)},${yT(d.temp).toFixed(1)}`).join(' ');
  const fillPath = [
    `M ${xS(0).toFixed(1)},${(PAD.top+GH).toFixed(1)}`,
    ...hourlyData.map((d,i) => `L ${xS(i).toFixed(1)},${yT(d.temp).toFixed(1)}`),
    `L ${xS(N-1).toFixed(1)},${(PAD.top+GH).toFixed(1)} Z`
  ].join(' ');

  const bw = Math.max(2, (GW / N) * 0.6);
  const bars = hourlyData.map((d,i) => {
    if (d.precip <= 0) return '';
    const bh = (d.precip / pMax) * (GH * 0.35);
    return `<rect x="${(xS(i)-bw/2).toFixed(1)}" y="${(PAD.top+GH-bh).toFixed(1)}" width="${bw.toFixed(1)}" height="${bh.toFixed(1)}" fill="${gt.precipBar}" rx="1"/>`;
  }).join('');

  let xLabels='', icons='', gridLines='';
  hourlyData.forEach((d,i) => {
    const x = xS(i);
    if (i % 6 === 0) {
      const h = d.time.getHours();
      const newDay = h === 0 || i === 0;
      const lbl = newDay
        ? d.time.toLocaleDateString('pl-PL', { weekday:'short', day:'numeric', month:'numeric' })
        : `${String(h).padStart(2,'0')}:00`;
      gridLines += `<line x1="${x.toFixed(1)}" y1="${PAD.top}" x2="${x.toFixed(1)}" y2="${(PAD.top+GH).toFixed(1)}" stroke="${newDay?gt.gridDay:gt.gridHour}" stroke-width="${newDay?1.5:0.5}"/>`;
      xLabels   += `<text x="${x.toFixed(1)}" y="${(PAD.top+GH+16).toFixed(1)}" text-anchor="middle" font-size="${newDay?10:9}" fill="${newDay?gt.xDay:gt.xHour}" font-weight="${newDay?'600':'400'}">${lbl}</text>`;
    }
    if (i % 3 === 0 && d.symbol)
      icons += `<text x="${x.toFixed(1)}" y="${(PAD.top-8).toFixed(1)}" text-anchor="middle" font-size="14">${symEmoji(d.symbol)}</text>`;
  });

  const tTicks = [];
  for (let t = Math.ceil(tMin); t <= tMax; t++) if (t % 5 === 0) tTicks.push(t);
  const yAxis = tTicks.map(t =>
    `<text x="${(PAD.left-6).toFixed(1)}" y="${(yT(t)+4).toFixed(1)}" text-anchor="end" font-size="9" fill="${gt.axisText}">${t}°</text>
     <line x1="${PAD.left}" y1="${yT(t).toFixed(1)}" x2="${(PAD.left+GW).toFixed(1)}" y2="${yT(t).toFixed(1)}" stroke="${gt.gridH}" stroke-width="0.5" stroke-dasharray="3,3"/>`
  ).join('');

  const tLabels = hourlyData.map((d,i) => {
    if (i % 3 !== 0) return '';
    return `<text x="${xS(i).toFixed(1)}" y="${(yT(d.temp)-7).toFixed(1)}" text-anchor="middle" font-size="9" fill="${gt.tempLabel}" font-weight="600">${Math.round(d.temp)}°</text>`;
  }).join('');

  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;display:block;">
  <defs>
    <linearGradient id="tg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stop-color="${gt.tempFill}" stop-opacity="${gt.fillOp0}"/>
      <stop offset="100%" stop-color="${gt.tempFill}" stop-opacity="${gt.fillOp1}"/>
    </linearGradient>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stop-color="${gt.bg1}"/>
      <stop offset="100%" stop-color="${gt.bg2}"/>
    </linearGradient>
    <clipPath id="gc"><rect x="${PAD.left}" y="${PAD.top}" width="${GW}" height="${GH}"/></clipPath>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)" rx="12"/>
  <path d="${fillPath}" fill="url(#tg)" clip-path="url(#gc)"/>
  ${yAxis}
  ${gridLines}
  <g clip-path="url(#gc)">${bars}</g>
  <polyline points="${tempLine}" fill="none" stroke="${gt.tempLine}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round" clip-path="url(#gc)"/>
  <g clip-path="url(#gc)">${tLabels}</g>
  ${icons}
  ${xLabels}
  <rect x="${PAD.left}" y="${H-14}" width="10" height="8" fill="${gt.precipBar}" rx="1"/>
  <text x="${PAD.left+14}" y="${H-7}" font-size="8" fill="${gt.legend}">Opady (mm)</text>
  <rect x="${PAD.left+90}" y="${H-14}" width="18" height="2.5" fill="${gt.tempLine}" rx="1"/>
  <text x="${PAD.left+112}" y="${H-7}" font-size="8" fill="${gt.legend}">Temperatura (°C)</text>
</svg>`;
}

// ═══════════════════════════════════════════════════════════
// PODZIAŁ DZIENNY / GODZINOWY
// ═══════════════════════════════════════════════════════════
function buildDailyDetail(hourlyData, expandedDays) {
  const days = [];
  let curKey = null;
  for (const d of hourlyData) {
    const key = d.time.toDateString();
    if (key !== curKey) { days.push({ date: d.time, hours: [] }); curKey = key; }
    days[days.length - 1].hours.push(d);
  }

  const BAR_MAX = 10; // 10 mm = pełny słupek

  return days.map((day, dayIdx) => {
    const temps     = day.hours.map(h => h.temp).filter(t => t != null);
    const tMin      = Math.min(...temps);
    const tMax      = Math.max(...temps);
    const totalRain = day.hours.reduce((s, h) => s + (h.precip || 0), 0);
    const rainHours = day.hours.filter(h => h.precip > 0).length;
    const hasRain   = totalRain > 0;

    const symCount = {};
    for (const h of day.hours) if (h.symbol) symCount[h.symbol] = (symCount[h.symbol] || 0) + 1;
    const mainSym = Object.keys(symCount).sort((a,b) => symCount[b]-symCount[a])[0] ?? null;

    const isToday = day.date.toDateString() === new Date().toDateString();
    const dateStr = day.date.toLocaleDateString('pl-PL', { weekday:'long', day:'numeric', month:'short' });
    const isOpen  = expandedDays.has(dayIdx);

    const rainSummary = hasRain
      ? `<span class="d-rain">${totalRain.toFixed(1)} mm · ${rainHours}h</span>`
      : `<span class="d-dry">bez opadów</span>`;

    const header = `
      <div class="d-head${hasRain ? ' d-head--rain' : ''}" data-day="${dayIdx}">
        <span class="d-chevron${isOpen ? ' open' : ''}">▶</span>
        <span class="d-icon">${symEmoji(mainSym)}</span>
        <div class="d-info">
          <span class="d-name">${isToday ? '<b>Dziś</b>, ' : ''}${dateStr}</span>
          <div class="d-meta">
            <span class="d-temps">
              <span class="tmax">${Math.round(tMax)}°</span><span class="sep"> / </span><span class="tmin">${Math.round(tMin)}°</span>
            </span>
            ${rainSummary}
          </div>
        </div>
        ${hasRain ? `<span class="d-rain-badge">🌧</span>` : ''}
      </div>`;

    const hourRows = isOpen ? day.hours.map(h => {
      const timeStr  = `${String(h.time.getHours()).padStart(2,'0')}:00`;
      const barPct   = Math.min(100, ((h.precip || 0) / BAR_MAX) * 100).toFixed(1);
      const isHeavy  = h.precip >= 5;
      const isRainy  = h.precip > 0;
      const rowClass = isHeavy ? 'h-row heavy' : isRainy ? 'h-row rainy' : 'h-row';
      const windStr  = h.wind != null ? `${h.wind.toFixed(1)} <small>${windDir(h.windDir)}</small>` : '—';
      const humStr   = h.humidity != null ? `${Math.round(h.humidity)}%` : '';

      const rainCell = isRainy
        ? `<div class="rain-cell">
             <div class="rain-bar-bg"><div class="rain-bar-fill${isHeavy?' heavy':''}" style="width:${barPct}%"></div></div>
             <span class="rain-val">${h.precip.toFixed(1)}<small> mm</small></span>
           </div>`
        : `<div class="rain-cell"><span class="rain-empty">—</span></div>`;

      return `
        <div class="${rowClass}">
          <span class="h-time">${timeStr}</span>
          <span class="h-icon">${symEmoji(h.symbol)}</span>
          <span class="h-temp">${Math.round(h.temp)}°</span>
          ${rainCell}
          <span class="h-wind">💨 ${windStr}</span>
          ${humStr ? `<span class="h-hum">💧${humStr}</span>` : '<span></span>'}
        </div>`;
    }).join('') : '';

    return `<div class="d-group">${header}${isOpen ? `<div class="d-body">${hourRows}</div>` : ''}</div>`;
  }).join('');
}

// ═══════════════════════════════════════════════════════════
// CSS (używa CSS custom properties z motywu)
// ═══════════════════════════════════════════════════════════
const BASE_CSS = `
  :host { display:block; font-family:'Segoe UI',system-ui,sans-serif; }
  * { box-sizing:border-box; }
  .card {
    background: var(--c-bg);
    border-radius:14px; overflow:hidden; color:var(--c-text);
    box-shadow:0 4px 24px var(--c-shadow);
  }
  .header {
    display:flex; justify-content:space-between; align-items:center;
    padding:14px 18px 10px;
    border-bottom:1px solid var(--c-border);
  }
  .location   { display:flex; align-items:center; gap:10px; }
  .loc-icon   { font-size:2.4em; line-height:1; }
  .loc-name   { font-size:1.15em; font-weight:700; color:var(--c-name); }
  .loc-sub    { font-size:.72em; color:var(--c-text2); margin-top:1px; }
  .cur-stats  { text-align:right; }
  .temp-big   { font-size:2.2em; font-weight:800; color:var(--c-temp); line-height:1; }
  .deg        { font-size:.55em; font-weight:400; vertical-align:super; }
  .meta-row   { display:flex; gap:10px; justify-content:flex-end; font-size:.75em; color:var(--c-blue); margin-top:3px; flex-wrap:wrap; }
  .graph-wrap { padding:6px 8px 2px; }

  /* ── Sekcja dzienna ── */
  .detail-section { padding:4px 8px 10px; }
  .detail-title {
    font-size:.65em; font-weight:700; letter-spacing:.07em; text-transform:uppercase;
    color:var(--c-detail-title); padding:6px 4px 4px;
    border-bottom:1px solid var(--c-detail-border); margin-bottom:6px;
  }
  .d-group { margin-bottom:4px; border-radius:10px; overflow:hidden; border:1px solid var(--c-border2); }
  .d-head {
    display:flex; align-items:center; gap:10px; padding:9px 14px;
    cursor:pointer; user-select:none; background:var(--c-head-bg); transition:background .15s;
  }
  .d-head:hover { background:var(--c-head-hover); }
  .d-head--rain { border-left:3px solid var(--c-rain-border); }
  .d-chevron { font-size:.6em; color:var(--c-text3); transition:transform .2s; display:inline-block; width:10px; }
  .d-chevron.open { transform:rotate(90deg); }
  .d-icon  { font-size:1.4em; }
  .d-info  { flex:1; min-width:0; }
  .d-name  { font-size:.85em; color:var(--c-name); }
  .d-meta  { display:flex; gap:12px; flex-wrap:wrap; margin-top:1px; }
  .d-temps { font-size:.78em; }
  .tmax    { color:var(--c-temp); font-weight:700; }
  .tmin    { color:var(--c-tmin); }
  .sep     { color:var(--c-sep); }
  .d-rain  { font-size:.78em; font-weight:700; color:var(--c-rain); }
  .d-dry   { font-size:.78em; color:var(--c-dry); }
  .d-rain-badge { font-size:1.1em; margin-left:auto; }
  .d-body  { background:var(--c-body-bg); }
  .h-row {
    display:grid; grid-template-columns:44px 26px 38px 1fr 90px 42px;
    align-items:center; gap:6px; padding:5px 14px;
    border-top:1px solid var(--c-row-border); font-size:.78em;
  }
  .h-row.rainy { background:var(--c-row-rainy); }
  .h-row.heavy { background:var(--c-row-heavy); border-left:2px solid var(--c-hh-border); }
  .h-time { color:var(--c-text3); font-variant-numeric:tabular-nums; }
  .h-icon { text-align:center; }
  .h-temp { color:var(--c-temp); font-weight:700; text-align:right; }
  .h-wind { color:var(--c-text2); text-align:right; }
  .h-wind small { font-size:.85em; }
  .h-hum  { color:var(--c-hum); font-size:.82em; text-align:right; }
  .rain-cell   { display:flex; align-items:center; gap:6px; }
  .rain-bar-bg { flex:1; height:5px; background:var(--c-bar-bg); border-radius:3px; overflow:hidden; min-width:30px; }
  .rain-bar-fill       { height:100%; border-radius:3px; background:linear-gradient(90deg,#2563eb,#63b3ed); }
  .rain-bar-fill.heavy { background:linear-gradient(90deg,#1d4ed8,#38bdf8); }
  .rain-val   { color:var(--c-rain); font-weight:700; white-space:nowrap; min-width:42px; text-align:right; }
  .rain-val small { font-weight:400; color:var(--c-rain2); }
  .rain-empty { color:var(--c-rain-empty); min-width:42px; text-align:right; }

  .footer {
    padding:4px 14px 8px; font-size:.65em; color:var(--c-footer);
    display:flex; justify-content:space-between; align-items:center;
    border-top:1px solid var(--c-footer-border);
  }
  .footer a   { color:var(--c-link); text-decoration:none; }
  .loading    { display:flex; align-items:center; justify-content:center; gap:10px; height:160px; color:var(--c-text2); font-size:.85em; }
  .spinner    { width:20px; height:20px; border:2px solid var(--c-spin1); border-top-color:var(--c-spin2); border-radius:50%; animation:spin .8s linear infinite; }
  @keyframes spin { to { transform:rotate(360deg); } }
  .error      { display:flex; align-items:center; justify-content:center; height:120px; color:#f87171; font-size:.85em; }
  .icon-btn   { background:none; border:none; cursor:pointer; color:var(--c-blue2); font-size:.8em; padding:2px 4px; border-radius:4px; }
  .icon-btn:hover { color:var(--c-blue); background:var(--c-btn-hover); }
`;

// ═══════════════════════════════════════════════════════════
// GŁÓWNA KARTA
// ═══════════════════════════════════════════════════════════
class YrWeatherGraphCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode:'open' });
    this._config       = {};
    this._data         = null;
    this._loading      = false;
    this._lastFetch    = 0;
    this._timer        = null;
    this._expandedDays = new Set([0]);
  }

  setConfig(cfg) {
    this._config = {
      lat:              cfg.lat              ?? 51.8018,
      lon:              cfg.lon              ?? 19.7515,
      location_name:    cfg.location_name    ?? 'Brzeziny',
      hours:            Math.min(cfg.hours   ?? 72, 90),
      refresh_interval: cfg.refresh_interval ?? 1800,
      theme:            cfg.theme === 'light' ? 'light' : 'dark',
    };
    this._render();
    this._scheduleRefresh();
  }

  set hass(_) {
    if (!this._data && !this._loading) this._fetchData();
  }

  connectedCallback()    { this._scheduleRefresh(); }
  disconnectedCallback() { clearInterval(this._timer); }

  _scheduleRefresh() {
    clearInterval(this._timer);
    this._timer = setInterval(() => this._fetchData(), this._config.refresh_interval * 1000);
    if (Date.now() - this._lastFetch > 60_000) this._fetchData();
  }

  async _fetchData() {
    if (this._loading) return;
    this._loading = true;
    this._render();
    try {
      const r = await fetch(`${MET_API}?lat=${this._config.lat}&lon=${this._config.lon}`,
        { headers:{ 'User-Agent': UA } });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      this._data = this._parse(await r.json());
      this._lastFetch = Date.now();
    } catch(e) {
      console.error('[yr-weather-graph-card]', e);
      this._data = null;
    } finally {
      this._loading = false;
      this._render();
    }
  }

  _parse(json) {
    const now    = new Date();
    const cutoff = new Date(now.getTime() + this._config.hours * 3_600_000);
    return json.properties.timeseries
      .filter(s => { const t = new Date(s.time); return t >= now && t <= cutoff; })
      .map(s => {
        const d = s.data.instant.details;
        const n1 = s.data.next_1_hours, n6 = s.data.next_6_hours;
        return {
          time:    new Date(s.time),
          temp:    d.air_temperature         ?? null,
          wind:    d.wind_speed              ?? null,
          windDir: d.wind_from_direction     ?? null,
          humidity:d.relative_humidity       ?? null,
          precip:  n1?.details?.precipitation_amount ?? n6?.details?.precipitation_amount ?? 0,
          symbol:  n1?.summary?.symbol_code  ?? n6?.summary?.symbol_code ?? null,
        };
      })
      .filter(d => d.temp !== null);
  }

  _render() {
    const sh    = this.shadowRoot;
    const theme = this._config.theme || 'dark';
    const gt    = GRAPH_THEME[theme];
    const cur   = this._data?.[0] ?? null;
    const now   = new Date();
    const fetchTime = this._lastFetch
      ? new Date(this._lastFetch).toLocaleTimeString('pl-PL',{hour:'2-digit',minute:'2-digit'})
      : '—';

    const header = cur ? `
      <div class="header">
        <div class="location">
          <span class="loc-icon">${symEmoji(cur.symbol)}</span>
          <div>
            <div class="loc-name">${this._config.location_name}</div>
            <div class="loc-sub">${now.toLocaleDateString('pl-PL',{weekday:'long',day:'numeric',month:'long'})}</div>
          </div>
        </div>
        <div class="cur-stats">
          <div class="temp-big">${Math.round(cur.temp)}<span class="deg">°C</span></div>
          <div class="meta-row">
            ${cur.wind    != null ? `<span>💨 ${cur.wind.toFixed(1)} m/s ${windDir(cur.windDir)}</span>` : ''}
            ${cur.humidity!= null ? `<span>💧 ${Math.round(cur.humidity)}%</span>` : ''}
            ${cur.precip  >  0    ? `<span>🌧 ${cur.precip.toFixed(1)} mm</span>` : ''}
          </div>
        </div>
      </div>` : `<div class="header"><div class="loc-name">${this._config.location_name}</div></div>`;

    const graph = this._loading
      ? `<div class="loading"><div class="spinner"></div><span>Pobieranie danych…</span></div>`
      : this._data?.length > 0
        ? buildGraph(this._data, gt)
        : `<div class="error">⚠ Błąd pobierania z api.met.no</div>`;

    const detail = (!this._loading && this._data?.length > 0) ? `
      <div class="detail-section">
        <div class="detail-title">Szczegółowa prognoza — kliknij dzień aby rozwinąć</div>
        ${buildDailyDetail(this._data, this._expandedDays)}
      </div>` : '';

    sh.innerHTML = `
<style>:host{${THEME_VARS[theme]}}</style>
<style>${BASE_CSS}</style>
<div class="card">
  ${header}
  <div class="graph-wrap">${graph}</div>
  ${detail}
  <div class="footer">
    <span>Dane: <a href="https://api.met.no/" target="_blank">api.met.no</a></span>
    <span>Akt.: ${fetchTime} <button class="icon-btn" id="refresh-btn" title="Odśwież">⟳</button></span>
  </div>
</div>`;

    sh.getElementById('refresh-btn')?.addEventListener('click', () => this._fetchData());
    sh.querySelectorAll('.d-head').forEach(el => {
      el.addEventListener('click', () => {
        const idx = parseInt(el.dataset.day);
        if (this._expandedDays.has(idx)) this._expandedDays.delete(idx);
        else this._expandedDays.add(idx);
        this._render();
      });
    });
  }

  getCardSize() { return 9; }

  static getConfigElement() { return document.createElement('yr-weather-graph-card-editor'); }
  static getStubConfig()    { return { location_name:'Brzeziny', lat:51.8018, lon:19.7515, hours:72, theme:'dark' }; }
}

// ═══════════════════════════════════════════════════════════
// VISUAL EDITOR
// ═══════════════════════════════════════════════════════════
class YrWeatherGraphCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode:'open' });
    this._config    = {};
    this._searching = false;
    this._results   = [];
    this._searchErr = '';
    this._debounce  = null;
  }

  setConfig(cfg) { this._config = { ...cfg }; this._render(); }

  _fire(cfg) {
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: cfg }, bubbles: true, composed: true
    }));
  }

  async _search(query) {
    if (!query || query.length < 2) { this._results = []; this._render(); return; }
    this._searching = true; this._searchErr = ''; this._render();
    try {
      const r = await fetch(
        `${NOMINATIM_API}?q=${encodeURIComponent(query)}&format=json&limit=6&addressdetails=1`,
        { headers:{ 'Accept-Language':'pl', 'User-Agent': UA } });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = await r.json();
      this._results = data.map(item => ({
        name:  item.display_name,
        short: [item.address?.city||item.address?.town||item.address?.village||item.address?.county, item.address?.country].filter(Boolean).join(', '),
        lat:   parseFloat(item.lat),
        lon:   parseFloat(item.lon),
      }));
      if (!this._results.length) this._searchErr = 'Brak wyników – spróbuj innej nazwy.';
    } catch { this._searchErr = 'Błąd połączenia z Nominatim.'; }
    finally { this._searching = false; this._render(); }
  }

  _selectResult(r) {
    this._config = { ...this._config,
      location_name: r.short || r.name,
      lat: Math.round(r.lat * 10000) / 10000,
      lon: Math.round(r.lon * 10000) / 10000,
    };
    this._results = []; this._searchErr = '';
    this._fire(this._config); this._render();
  }

  _onChange(key, value) { this._config = { ...this._config, [key]: value }; this._fire(this._config); }

  _render() {
    const sh  = this.shadowRoot;
    const cfg = this._config;
    const isDark = (cfg.theme || 'dark') === 'dark';

    sh.innerHTML = `
<style>
  :host { display:block; font-family:'Segoe UI',system-ui,sans-serif; padding:4px; }
  * { box-sizing:border-box; }
  .section { margin-bottom:18px; }
  .label { font-size:.78em; color:#94a3b8; margin-bottom:4px; font-weight:600; letter-spacing:.03em; text-transform:uppercase; }
  .row   { display:flex; gap:8px; align-items:stretch; }
  input, select {
    width:100%; padding:8px 10px; border-radius:8px;
    border:1px solid rgba(255,255,255,.12);
    background:rgba(255,255,255,.05); color:#e2e8f0;
    font-size:.88em; outline:none; transition:border-color .15s;
  }
  input:focus, select:focus { border-color:#3b82f6; }
  input::placeholder { color:#64748b; }
  select option { background:#1e293b; }
  .search-btn {
    padding:8px 14px; border-radius:8px; border:none; cursor:pointer;
    background:#3b82f6; color:#fff; font-size:.88em; font-weight:600;
    white-space:nowrap; transition:background .15s;
  }
  .search-btn:hover { background:#2563eb; }
  .search-btn:disabled { background:#1e3a5f; color:#64748b; cursor:default; }
  .results { margin-top:6px; border-radius:8px; overflow:hidden; border:1px solid rgba(255,255,255,.1); }
  .result-item { padding:8px 12px; cursor:pointer; border-bottom:1px solid rgba(255,255,255,.06); transition:background .1s; }
  .result-item:last-child { border-bottom:none; }
  .result-item:hover { background:rgba(59,130,246,.2); }
  .result-name   { font-size:.85em; color:#e2e8f0; font-weight:600; }
  .result-full   { font-size:.72em; color:#64748b; margin-top:1px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .result-coords { font-size:.7em; color:#3b82f6; margin-top:1px; }
  .current-loc {
    display:flex; align-items:center; gap:10px; padding:10px 12px; border-radius:8px;
    background:rgba(59,130,246,.1); border:1px solid rgba(59,130,246,.25); margin-bottom:6px;
  }
  .loc-pin { font-size:1.4em; }
  .loc-name { font-size:.9em; font-weight:700; color:#93c5fd; }
  .loc-coord { font-size:.72em; color:#64748b; margin-top:1px; }
  .spinner-sm { display:inline-block; width:14px; height:14px; border:2px solid #1e40af; border-top-color:#93c5fd; border-radius:50%; animation:spin .8s linear infinite; vertical-align:middle; margin-right:6px; }
  @keyframes spin { to { transform:rotate(360deg); } }
  .err  { font-size:.78em; color:#f87171; padding:6px; }
  .hint { font-size:.72em; color:#64748b; margin-top:4px; }
  .divider { height:1px; background:rgba(255,255,255,.07); margin:16px 0; }
  .inline-fields { display:grid; grid-template-columns:1fr 1fr; gap:8px; }

  /* Przełącznik motywu */
  .theme-row { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
  .theme-btn {
    padding:10px 8px; border-radius:8px; border:1px solid rgba(255,255,255,.1);
    background:rgba(255,255,255,.04); color:#64748b; cursor:pointer;
    font-size:.85em; font-weight:600; text-align:center; transition:all .15s;
  }
  .theme-btn:hover { background:rgba(255,255,255,.08); color:#94a3b8; }
  .theme-btn.active {
    background:rgba(59,130,246,.2); border-color:rgba(59,130,246,.5); color:#93c5fd;
  }
</style>

<div class="section">
  <div class="label">📍 Aktualna lokalizacja</div>
  <div class="current-loc">
    <span class="loc-pin">🌍</span>
    <div>
      <div class="loc-name">${cfg.location_name || '(nie ustawiono)'}</div>
      <div class="loc-coord">${cfg.lat != null ? `${cfg.lat}°N, ${cfg.lon}°E` : 'Brak współrzędnych'}</div>
    </div>
  </div>
</div>

<div class="section">
  <div class="label">🔍 Wyszukaj miasto / miejscowość</div>
  <div class="row">
    <input id="search-input" type="text" placeholder="np. Warszawa, Berlin, Paris…" value="" autocomplete="off" spellcheck="false"/>
    <button class="search-btn" id="search-btn" ${this._searching ? 'disabled' : ''}>
      ${this._searching ? '<span class="spinner-sm"></span>Szukam…' : 'Szukaj'}
    </button>
  </div>
  <div class="hint">Wyszukiwanie przez OpenStreetMap Nominatim – działa globalnie.</div>
  ${this._searchErr ? `<div class="err">⚠ ${this._searchErr}</div>` : ''}
  ${this._results.length ? `
    <div class="results">
      ${this._results.map((r,i) => `
        <div class="result-item" data-idx="${i}">
          <div class="result-name">${r.short || r.name.split(',')[0]}</div>
          <div class="result-full">${r.name}</div>
          <div class="result-coords">${r.lat.toFixed(4)}°N, ${r.lon.toFixed(4)}°E</div>
        </div>`).join('')}
    </div>` : ''}
</div>

<div class="divider"></div>

<div class="section">
  <div class="label">🎨 Motyw karty</div>
  <div class="theme-row">
    <button class="theme-btn${isDark ? ' active' : ''}" data-theme="dark">🌙 Ciemny</button>
    <button class="theme-btn${!isDark ? ' active' : ''}" data-theme="light">☀️ Jasny</button>
  </div>
</div>

<div class="section">
  <div class="label">⚙️ Ustawienia zaawansowane</div>
  <div class="inline-fields">
    <div>
      <div class="label" style="margin-top:0">Nazwa wyświetlana</div>
      <input id="loc-name" type="text" value="${cfg.location_name || ''}" placeholder="np. Moje miasto"/>
    </div>
    <div>
      <div class="label" style="margin-top:0">Horyzont prognozy</div>
      <select id="hours">
        ${[24,48,72,90].map(h => `<option value="${h}" ${cfg.hours==h?'selected':''}>${h}h</option>`).join('')}
      </select>
    </div>
    <div>
      <div class="label" style="margin-top:0">Szerokość geogr. (lat)</div>
      <input id="lat" type="number" step="0.0001" value="${cfg.lat ?? ''}" placeholder="np. 51.8"/>
    </div>
    <div>
      <div class="label" style="margin-top:0">Długość geogr. (lon)</div>
      <input id="lon" type="number" step="0.0001" value="${cfg.lon ?? ''}" placeholder="np. 19.75"/>
    </div>
  </div>
  <div style="margin-top:8px">
    <div class="label">Odświeżanie</div>
    <select id="refresh">
      ${[[900,'15 minut'],[1800,'30 minut'],[3600,'1 godzina'],[7200,'2 godziny']].map(
        ([v,l]) => `<option value="${v}" ${cfg.refresh_interval==v?'selected':''}>${l}</option>`).join('')}
    </select>
  </div>
</div>`;

    // Zdarzenia wyszukiwarki
    const input = sh.getElementById('search-input');
    const btn   = sh.getElementById('search-btn');
    const doSearch = () => this._search(input.value.trim());
    btn.addEventListener('click', doSearch);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(); });
    input.addEventListener('input', () => {
      clearTimeout(this._debounce);
      if (input.value.length > 2) this._debounce = setTimeout(doSearch, 600);
      else { this._results = []; this._searchErr = ''; this._render(); }
    });
    sh.querySelectorAll('.result-item').forEach(el =>
      el.addEventListener('click', () => this._selectResult(this._results[+el.dataset.idx])));

    // Przełącznik motywu
    sh.querySelectorAll('.theme-btn').forEach(el =>
      el.addEventListener('click', () => this._onChange('theme', el.dataset.theme)));

    // Pola zaawansowane
    sh.getElementById('loc-name').addEventListener('change', e => this._onChange('location_name', e.target.value));
    sh.getElementById('lat').addEventListener('change',      e => this._onChange('lat', parseFloat(e.target.value)));
    sh.getElementById('lon').addEventListener('change',      e => this._onChange('lon', parseFloat(e.target.value)));
    sh.getElementById('hours').addEventListener('change',    e => this._onChange('hours', parseInt(e.target.value)));
    sh.getElementById('refresh').addEventListener('change',  e => this._onChange('refresh_interval', parseInt(e.target.value)));
  }
}

// ═══════════════════════════════════════════════════════════
// REJESTRACJA
// ═══════════════════════════════════════════════════════════
customElements.define('yr-weather-graph-card',        YrWeatherGraphCard);
customElements.define('yr-weather-graph-card-editor', YrWeatherGraphCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type:        'yr-weather-graph-card',
  name:        'Yr Weather Graph',
  description: 'Graf pogodowy z met.no — temperatura, opady, szczegóły godzinowe. Motyw ciemny i jasny.',
  preview:     false,
});
