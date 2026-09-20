/**
 * CabeIndex - Core Frontend Engine
 * Zero dependencies, pure vanilla JS + SVG + Canvas
 */

// Fallback dataset in case opened via file:// or network error
const FALLBACK_DATA = {
  score: 50.7,
  tier: {
    min: 46,
    max: 70,
    id: "nampol",
    label: "Pedas Nampol",
    chiliName: "Cabe Rawit Merah",
    color: "#EF4444",
    badgeBg: "rgba(239, 68, 68, 0.15)",
    description: "Sorotan tajam terhadap institusi, tekanan ekonomi terasa, dan kritik publik menguat.",
    mascot: "sweating"
  },
  delta24h: 3.2,
  updatedAt: new Date().toISOString(),
  articlesAnalyzed: 50,
  subIndices: {
    institusi: {
      score: 54,
      label: "Hukum & Institusi",
      desc: "Integritas KPK, DPR, Kementerian, dan Penegakan Regulasi",
      weight: "40%"
    },
    ekonomi: {
      score: 51,
      label: "Dapur & Ekonomi",
      desc: "Harga Pangan, Inflasi, Pajak, dan Lapangan Pekerjaan",
      weight: "35%"
    },
    sosial: {
      score: 46,
      label: "Tensi Sosial & Publik",
      desc: "Aksi Massa, Petisi Publik, dan Sentimen Percakapan Sipil",
      weight: "25%"
    }
  },
  topDrivers: [
    {
      title: "RUU Perampasan Aset: Mengapa penting untuk berantas korupsi?",
      snippet: "Pemberantasan korupsi membutuhkan instrumen pemulihan aset negara secara tegas dan transparan.",
      source: "Antara News",
      url: "https://www.antaranews.com/berita/5741441/ruu-perampasan-aset-mengapa-penting-untuk-berantas-korupsi",
      category: "institusi",
      pubDate: "Selasa, 15 Sep 2026",
      heatScore: 60,
      sentiment: "waspada"
    },
    {
      title: "Baleg DPR Serap Masukan Terkait Perubahan Status Jakarta dan Prolegnas",
      snippet: "Pembahasan prioritas legislasi nasional berfokus pada penyesuaian regulasi kelembagaan dan efisiensi publik.",
      source: "Tempo",
      url: "https://nasional.tempo.co/",
      category: "institusi",
      pubDate: "Senin, 14 Sep 2026",
      heatScore: 55,
      sentiment: "waspada"
    },
    {
      title: "Beras dan Minyak Goreng Naik Jelang Akhir Bulan, Warga Harapkan Intervensi Pasar",
      snippet: "Kenaikan harga pangan di pasar tradisional menuntut akselerasi operasi pasar dan stabilisasi pasokan.",
      source: "Detikcom",
      url: "https://news.detik.com/",
      category: "ekonomi",
      pubDate: "Senin, 14 Sep 2026",
      heatScore: 56,
      sentiment: "waspada"
    },
    {
      title: "Pemerintah Tingkatkan Alokasi Program Padat Karya untuk Serap Tenaga Kerja",
      snippet: "Program infrastruktur berbasis komunitas melibatkan ribuan warga dalam pemeliharaan sarana publik.",
      source: "CNBC Indonesia",
      url: "https://www.cnbcindonesia.com/",
      category: "ekonomi",
      pubDate: "Minggu, 13 Sep 2026",
      heatScore: 42,
      sentiment: "positif"
    }
  ]
};

const MASCOT_ICONS = {
  relaxed: '😎',   // 0-20
  smirk: '🌶️',     // 21-45
  sweating: '🥵',  // 46-70
  screaming: '🔥', // 71-85
  volcanic: '🌋'   // 86-100
};

let currentData = FALLBACK_DATA;
let historyData = [];

// ==========================================================================
// 1. ODOMETER GAUGE SVG GENERATOR & NEEDLE ANIMATION
// ==========================================================================
function setupOdometer(targetScore, tier) {
  const container = document.getElementById('gauge-container');
  if (!container) return;

  // Arc specifications: semi-circle from 180° (left) to 0° (right)
  const cx = 150;
  const cy = 135;
  const r = 105;

  // Render SVG Dial
  container.innerHTML = `
    <svg class="gauge-svg" viewBox="0 0 300 175">
      <defs>
        <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#10B981" />
          <stop offset="25%" stop-color="#F59E0B" />
          <stop offset="55%" stop-color="#EF4444" />
          <stop offset="80%" stop-color="#DC2626" />
          <stop offset="100%" stop-color="#9333EA" />
        </linearGradient>
        <filter id="needleGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="${tier.color}" flood-opacity="0.8"/>
        </filter>
      </defs>

      <!-- Background track -->
      <path d="M 45,135 A 105,105 0 0,1 255,135" class="gauge-bg-track" />

      <!-- Active colored track -->
      <path d="M 45,135 A 105,105 0 0,1 255,135" stroke="url(#gaugeGradient)" class="gauge-active-track" stroke-dasharray="330" stroke-dashoffset="0" opacity="0.9" />

      <!-- Scale Ticks -->
      ${[0, 25, 50, 75, 100].map(val => {
        const angle = Math.PI - (val / 100) * Math.PI;
        const x1 = cx + (r - 12) * Math.cos(angle);
        const y1 = cy - (r - 12) * Math.sin(angle);
        const x2 = cx + (r + 12) * Math.cos(angle);
        const y2 = cy - (r + 12) * Math.sin(angle);
        const textX = cx + (r - 26) * Math.cos(angle);
        const textY = cy - (r - 26) * Math.sin(angle) + 4;
        return `
          <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="rgba(255,255,255,0.4)" stroke-width="2" />
          <text x="${textX}" y="${textY}" fill="#94a3b8" font-size="10" font-family="monospace" font-weight="700" text-anchor="middle">${val}</text>
        `;
      }).join('')}

      <!-- Animated Needle -->
      <g id="gauge-needle-group" filter="url(#needleGlow)" style="transform-origin: ${cx}px ${cy}px; transform: rotate(-90deg); transition: transform 1.5s cubic-bezier(0.16, 1, 0.3, 1);">
        <!-- Needle body -->
        <polygon points="${cx - 4},${cy} ${cx},${cy - 92} ${cx + 4},${cy}" fill="${tier.color}" />
        <polygon points="${cx - 2},${cy} ${cx},${cy - 92} ${cx + 2},${cy}" fill="#ffffff" opacity="0.7" />
        <!-- Center Hub -->
        <circle cx="${cx}" cy="${cy}" r="10" fill="#1e293b" stroke="${tier.color}" stroke-width="3" />
        <circle cx="${cx}" cy="${cy}" r="4" fill="#ffffff" />
      </g>
    </svg>
  `;

  // Animate needle rotation:
  // 0 -> -90deg, 50 -> 0deg, 100 -> +90deg
  const targetDegrees = -90 + (targetScore / 100) * 180;
  setTimeout(() => {
    const needle = document.getElementById('gauge-needle-group');
    if (needle) {
      needle.style.transform = `rotate(${targetDegrees}deg)`;
    }
  }, 100);

  // Update Mascot
  const mascotEl = document.getElementById('mascot-avatar');
  if (mascotEl) {
    mascotEl.textContent = MASCOT_ICONS[tier.mascot] || '🌶️';
  }
}

// ==========================================================================
// 2. AMBIENT EMBER & SMOKE PARTICLES
// ==========================================================================
class ParticleSystem {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  resize() {
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
  }

  addParticle() {
    if (this.particles.length > 40) return;
    this.particles.push({
      x: Math.random() * this.width,
      y: this.height + 10,
      size: Math.random() * 3 + 1,
      speedY: Math.random() * 1.2 + 0.4,
      speedX: (Math.random() - 0.5) * 0.8,
      opacity: Math.random() * 0.5 + 0.3,
      color: Math.random() > 0.4 ? '239, 68, 68' : '245, 158, 11'
    });
  }

  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    if (currentData.score >= 45 && Math.random() < 0.25) {
      this.addParticle();
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.y -= p.speedY;
      p.x += p.speedX;
      p.opacity -= 0.002;

      if (p.opacity <= 0 || p.y < -10) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(${p.color}, ${p.opacity})`;
      this.ctx.shadowBlur = 8;
      this.ctx.shadowColor = `rgba(${p.color}, 0.8)`;
      this.ctx.fill();
    }
    requestAnimationFrame(this.animate);
  }
}

// ==========================================================================
// 3. RENDER SUB-INDICES & TOP DRIVERS
// ==========================================================================
function renderUI(data) {
  // Update CSS custom properties for dynamic theming
  document.documentElement.style.setProperty('--current-heat', data.tier.color);
  document.documentElement.style.setProperty('--current-glow', data.tier.badgeBg.replace('0.15', '0.35'));

  // Score & Tier
  document.getElementById('score-number').textContent = data.score.toFixed(1);
  const tierPill = document.getElementById('tier-pill');
  tierPill.textContent = data.tier.label;
  tierPill.style.background = data.tier.badgeBg;
  tierPill.style.color = data.tier.color;
  tierPill.style.border = `1px solid ${data.tier.color}44`;

  document.getElementById('tier-chili-name').textContent = data.tier.chiliName;
  document.getElementById('hero-desc').textContent = data.tier.description;

  // Delta 24h
  const deltaBadge = document.getElementById('delta-badge');
  const delta = data.delta24h;
  const absDelta = Math.abs(delta).toFixed(1);
  if (delta > 0) {
    deltaBadge.className = 'delta-badge up';
    deltaBadge.innerHTML = `▲ +${absDelta} vs kemarin (Makin Panas)`;
  } else if (delta < 0) {
    deltaBadge.className = 'delta-badge down';
    deltaBadge.innerHTML = `▼ -${absDelta} vs kemarin (Mereda)`;
  } else {
    deltaBadge.className = 'delta-badge neutral';
    deltaBadge.innerHTML = `― Stabil vs kemarin`;
  }

  // Articles count & timestamp
  document.getElementById('articles-count').textContent = data.articlesAnalyzed || 50;
  const dateObj = new Date(data.updatedAt);
  const timeFormatted = dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  document.getElementById('last-updated').textContent = `Hari ini, ${timeFormatted} WIB`;

  // Sub-Indices
  const subGrid = document.getElementById('subindices-grid');
  subGrid.innerHTML = Object.entries(data.subIndices).map(([key, item]) => {
    let color = '#10B981';
    if (item.score > 70) color = '#DC2626';
    else if (item.score > 45) color = '#EF4444';
    else if (item.score > 25) color = '#F59E0B';

    return `
      <div class="subindex-card">
        <div class="subindex-header">
          <div class="subindex-name">${item.label}</div>
          <div class="subindex-weight">Bobot ${item.weight}</div>
        </div>
        <div class="subindex-desc">${item.desc}</div>
        <div class="subindex-meter-wrapper">
          <div class="subindex-meter-info">
            <span style="font-size:0.75rem; color:var(--text-muted);">Tensi Pilar</span>
            <span class="subindex-score" style="color:${color}">${item.score} <span style="font-size:0.8rem; color:var(--text-muted);">/100</span></span>
          </div>
          <div class="subindex-bar-track">
            <div class="subindex-bar-fill" style="width:${item.score}%; background:${color};"></div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // News Drivers Feed
  const driversGrid = document.getElementById('drivers-grid');
  driversGrid.innerHTML = data.topDrivers.map(item => `
    <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="driver-card">
      <div class="driver-card-header">
        <span class="driver-source">${item.source}</span>
        <span class="driver-sentiment sentiment-${item.sentiment}">${item.sentiment}</span>
      </div>
      <div class="driver-title">${item.title}</div>
      <div class="driver-snippet">${item.snippet || ''}</div>
      <div class="driver-footer">
        <span>${item.pubDate ? item.pubDate.split(' ').slice(0, 4).join(' ') : 'Terkini'}</span>
        <span class="heat-badge">Poin Tensi: ${item.heatScore} 🌶️</span>
      </div>
    </a>
  `).join('');

  // Setup gauge
  setupOdometer(data.score, data.tier);
}

// ==========================================================================
// 4. TRENDLINE CHART (Interactive SVG)
// ==========================================================================
function renderTrendChart(history, daysLimit = 7) {
  const container = document.getElementById('trend-chart-container');
  if (!container || !history || history.length === 0) return;

  const slice = history.slice(-daysLimit);
  const width = container.clientWidth || 800;
  const height = 180;
  const padding = { top: 25, right: 30, bottom: 35, left: 35 };

  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const maxVal = 100;
  const minVal = 0;

  const points = slice.map((d, i) => {
    const x = padding.left + (i / (slice.length - 1)) * chartW;
    const y = padding.top + chartH - ((d.score - minVal) / (maxVal - minVal)) * chartH;
    return { ...d, x, y };
  });

  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x},${p.y}` : `${acc} L ${p.x},${p.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x},${padding.top + chartH} L ${points[0].x},${padding.top + chartH} Z`;

  container.innerHTML = `
    <svg class="trend-chart-svg" viewBox="0 0 ${width} ${height}">
      <defs>
        <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#EF4444" stop-opacity="0.35"/>
          <stop offset="100%" stop-color="#EF4444" stop-opacity="0.0"/>
        </linearGradient>
      </defs>

      <!-- Horizontal grid lines -->
      ${[25, 50, 75].map(v => {
        const y = padding.top + chartH - ((v - minVal) / (maxVal - minVal)) * chartH;
        return `
          <line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" stroke="rgba(255,255,255,0.06)" stroke-dasharray="4" />
          <text x="${padding.left - 8}" y="${y + 3}" fill="#64748b" font-size="9" text-anchor="end">${v}</text>
        `;
      }).join('')}

      <!-- Filled Area -->
      <path d="${areaD}" fill="url(#areaGradient)" />

      <!-- Main Trendline -->
      <path d="${pathD}" fill="none" stroke="#EF4444" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />

      <!-- Interactive Circles & Date Labels -->
      ${points.map((p, i) => `
        <g class="chart-point" data-date="${p.date}" data-score="${p.score}" data-label="${p.label}" data-highlight="${p.highlight}">
          <circle cx="${p.x}" cy="${p.y}" r="5" fill="#121820" stroke="#EF4444" stroke-width="2.5" style="cursor:pointer; transition: r 0.2s ease;" />
          <text x="${p.x}" y="${height - 10}" fill="#64748b" font-size="10" font-family="monospace" text-anchor="middle">${p.date.slice(5)}</text>
        </g>
      `).join('')}
    </svg>
    <div id="chart-tooltip" class="chart-tooltip"></div>
  `;

  // Attach hover events for tooltips
  const tooltip = document.getElementById('chart-tooltip');
  container.querySelectorAll('.chart-point').forEach(pt => {
    pt.addEventListener('mouseenter', e => {
      const circle = pt.querySelector('circle');
      circle.setAttribute('r', '8');
      const date = pt.dataset.date;
      const score = pt.dataset.score;
      const label = pt.dataset.label;
      const highlight = pt.dataset.highlight;

      tooltip.innerHTML = `
        <div style="font-weight:700; color:#f8fafc;">${date} • ${score} (${label})</div>
        <div style="font-size:0.7rem; color:#94a3b8; margin-top:2px;">${highlight}</div>
      `;
      tooltip.style.opacity = '1';
      tooltip.style.left = `${parseFloat(circle.getAttribute('cx')) - 40}px`;
      tooltip.style.top = `${parseFloat(circle.getAttribute('cy')) - 60}px`;
    });

    pt.addEventListener('mouseleave', () => {
      pt.querySelector('circle').setAttribute('r', '5');
      tooltip.style.opacity = '0';
    });
  });
}

// ==========================================================================
// 5. VIRAL SHARE CARD GENERATOR (HTML5 CANVAS)
// ==========================================================================
function generateShareCard(data) {
  const canvas = document.getElementById('share-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  canvas.width = 1200;
  canvas.height = 630;

  // Background Dark Gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 1200, 630);
  bgGrad.addColorStop(0, '#0b0f14');
  bgGrad.addColorStop(1, '#18202b');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1200, 630);

  // Fiery Radial Glow on Top-Right
  const glow = ctx.createRadialGradient(1000, 100, 10, 1000, 100, 500);
  glow.addColorStop(0, data.tier.color + '44');
  glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, 1200, 630);

  // Border frame
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 4;
  ctx.strokeRect(30, 30, 1140, 570);

  // Brand Header
  ctx.font = 'bold 38px system-ui, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('🌶️ CabeIndex', 70, 95);

  ctx.font = '20px system-ui, sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('Barometer Tensi Politik & Kepercayaan Publik Indonesia', 70, 130);

  // Left Block: Odometer Score Box
  ctx.fillStyle = '#121820';
  ctx.fillRect(70, 170, 420, 380);
  ctx.strokeStyle = data.tier.color + '66';
  ctx.strokeRect(70, 170, 420, 380);

  ctx.font = '16px system-ui, sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('INDEX KEPEDASAN NASIONAL', 100, 215);

  ctx.font = 'bold 110px monospace';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(data.score.toFixed(1), 100, 325);

  ctx.font = 'bold 30px monospace';
  ctx.fillStyle = '#64748b';
  ctx.fillText('/100', 370, 325);

  // Tier Badge Box
  ctx.fillStyle = data.tier.color + '25';
  ctx.fillRect(100, 360, 350, 60);
  ctx.strokeStyle = data.tier.color;
  ctx.strokeRect(100, 360, 350, 60);

  ctx.font = 'bold 24px system-ui, sans-serif';
  ctx.fillStyle = data.tier.color;
  ctx.fillText(`${data.tier.label}`, 120, 398);

  ctx.font = '18px system-ui, sans-serif';
  ctx.fillStyle = '#cbd5e1';
  ctx.fillText(`• ${data.tier.chiliName}`, 310, 398);

  ctx.font = '15px system-ui, sans-serif';
  ctx.fillStyle = '#94a3b8';
  const desc = data.tier.description.length > 45 ? data.tier.description.slice(0, 42) + '...' : data.tier.description;
  ctx.fillText(desc, 100, 460);

  // Right Block: Top News Drivers
  ctx.font = 'bold 22px system-ui, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('🔥 Pemicu Utama Hari Ini:', 530, 210);

  const drivers = data.topDrivers.slice(0, 3);
  drivers.forEach((drv, i) => {
    const y = 250 + (i * 95);
    ctx.fillStyle = '#1a222c';
    ctx.fillRect(530, y, 600, 80);

    ctx.font = 'bold 13px system-ui, sans-serif';
    ctx.fillStyle = drv.sentiment === 'kritis' ? '#f87171' : '#fbbf24';
    ctx.fillText(`[${drv.source.toUpperCase()}] ${drv.sentiment.toUpperCase()}`, 550, y + 26);

    ctx.font = '16px system-ui, sans-serif';
    ctx.fillStyle = '#f8fafc';
    const title = drv.title.length > 55 ? drv.title.slice(0, 52) + '...' : drv.title;
    ctx.fillText(title, 550, y + 55);
  });

  // Footer inside card
  ctx.font = '16px monospace';
  ctx.fillStyle = '#64748b';
  const dateStr = new Date(data.updatedAt).toLocaleDateString('id-ID', { dateStyle: 'full' });
  ctx.fillText(`Update: ${dateStr} • cabeindex.id`, 530, 575);
}

// ==========================================================================
// 6. INITIALIZATION & DATA FETCHING
// ==========================================================================
async function initApp() {
  new ParticleSystem('particle-canvas');

  // Try fetching fresh data from static json, fallback if offline or restricted
  try {
    const res = await fetch('data/current.json');
    if (res.ok) {
      currentData = await res.json();
    }
  } catch (_) {
    // Graceful fallback to FALLBACK_DATA
  }

  renderUI(currentData);

  // Fetch History for Trend Chart
  try {
    const histRes = await fetch('data/history.json');
    if (histRes.ok) {
      historyData = await histRes.json();
      renderTrendChart(historyData, 7);
    }
  } catch (_) {
    // Generate simple mock history if needed
    historyData = Array.from({ length: 30 }, (_, i) => ({
      date: `2026-09-${String(i + 1).padStart(2, '0')}`,
      score: 45 + Math.sin(i * 0.5) * 15,
      label: 'Pedas Nampol',
      highlight: 'Dinamika kebijakan dan inflasi pangan'
    }));
    renderTrendChart(historyData, 7);
  }

  // Bind Trend Chart filter buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const days = parseInt(btn.dataset.days, 10) || 7;
      renderTrendChart(historyData, days);
    });
  });

  // Share Modal Handlers
  const modal = document.getElementById('share-modal');
  const openBtn = document.getElementById('open-share-btn');
  const closeBtn = document.getElementById('close-modal-btn');
  const downloadBtn = document.getElementById('download-card-btn');
  const copyBtn = document.getElementById('copy-link-btn');

  if (openBtn && modal) {
    openBtn.addEventListener('click', () => {
      generateShareCard(currentData);
      modal.classList.add('active');
    });
  }

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('active');
    });
  }

  if (modal) {
    modal.addEventListener('click', e => {
      if (e.target === modal) modal.classList.remove('active');
    });
  }

  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      const canvas = document.getElementById('share-canvas');
      const link = document.createElement('a');
      link.download = `cabeindex-${new Date().toISOString().slice(0, 10)}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    });
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const text = `🌶️ Skor CabeIndex Hari Ini: ${currentData.score} (${currentData.tier.label} - ${currentData.tier.chiliName})\nCek kondisi sentimen negara di https://cabeindex.id`;
      navigator.clipboard.writeText(text).then(() => {
        copyBtn.textContent = '✓ Tersalin!';
        setTimeout(() => { copyBtn.textContent = 'Salin Teks'; }, 2000);
      });
    });
  }
}

document.addEventListener('DOMContentLoaded', initApp);
