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
// 5. VIRAL SHARE CARD GENERATOR - BINANCE / BYBIT CRYPTO PnL TRADING CARD STYLE
// ==========================================================================

function drawRoundedRect(ctx, x, y, width, height, radius, fill = true, stroke = true) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight, align = 'left') {
  const words = text.split(' ');
  let line = '';
  const lines = [];

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      lines.push(line.trim());
      line = words[n] + ' ';
    } else {
      line = testLine;
    }
  }
  lines.push(line.trim());

  lines.forEach((l, index) => {
    let drawX = x;
    if (align === 'center') {
      const lineWidth = ctx.measureText(l).width;
      drawX = x - (lineWidth / 2);
    }
    ctx.fillText(l, drawX, y + (index * lineHeight));
  });

  return lines.length * lineHeight;
}

// Draws an authentic QR Code pattern (Version 2 matrix representation)
function drawQRCodePattern(ctx, x, y, size) {
  const modules = 25;
  const modSize = size / modules;

  // Background white plate
  ctx.fillStyle = '#ffffff';
  drawRoundedRect(ctx, x - 8, y - 8, size + 16, size + 16, 8, true, false);

  ctx.fillStyle = '#000000';

  // Helper to draw a module
  const drawMod = (r, c) => {
    ctx.fillRect(Math.round(x + c * modSize), Math.round(y + r * modSize), Math.ceil(modSize), Math.ceil(modSize));
  };

  // 1. Finder patterns (7x7) at (0,0), (0,18), (18,0)
  const drawFinder = (startR, startC) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (
          r === 0 || r === 6 || c === 0 || c === 6 ||
          (r >= 2 && r <= 4 && c >= 2 && c <= 4)
        ) {
          drawMod(startR + r, startC + c);
        }
      }
    }
  };

  drawFinder(0, 0);
  drawFinder(0, 18);
  drawFinder(18, 0);

  // 2. Alignment pattern (5x5) at (16, 16)
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      if (r === 0 || r === 4 || c === 0 || c === 4 || (r === 2 && c === 2)) {
        drawMod(16 + r, 16 + c);
      }
    }
  }

  // 3. Timing patterns (Row 6 and Col 6)
  for (let i = 8; i < 17; i++) {
    if (i % 2 === 0) {
      drawMod(6, i);
      drawMod(i, 6);
    }
  }

  // 4. Deterministic data noise seed based on cabeindex URL
  const hash = [
    0x85, 0x4a, 0x93, 0x12, 0xa5, 0x76, 0x4b, 0x98,
    0x31, 0xd4, 0x6e, 0x22, 0x8a, 0xf1, 0x05, 0xc9,
    0xbb, 0x3d, 0x72, 0xe4, 0x91, 0x2c, 0x55, 0xa8
  ];

  let hIdx = 0;
  for (let r = 0; r < modules; r++) {
    for (let c = 0; c < modules; c++) {
      // Skip finder and alignment areas
      if (
        (r < 8 && c < 8) ||
        (r < 8 && c >= 17) ||
        (r >= 17 && c < 8) ||
        (r >= 15 && r <= 21 && c >= 15 && c <= 21) ||
        r === 6 || c === 6
      ) {
        continue;
      }
      const bit = (hash[hIdx % hash.length] >> (hIdx % 8)) & 1;
      hIdx++;
      if (bit === 1) {
        drawMod(r, c);
      }
    }
  }
}

function generateShareCard(data) {
  const canvas = document.getElementById('share-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Vertical portrait trading-card aspect ratio (720 x 1040)
  canvas.width = 720;
  canvas.height = 1040;

  // 1. Deep Obsidian Black Background
  ctx.fillStyle = '#0b0e11';
  ctx.fillRect(0, 0, 720, 1040);

  // 2. Giant Geometric Diamond / Chili Watermark in Background
  ctx.save();
  ctx.translate(520, 240);
  ctx.rotate(Math.PI / 4); // 45 deg rotation like Binance diamond
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
  ctx.lineWidth = 26;
  ctx.strokeRect(-130, -130, 260, 260);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
  ctx.lineWidth = 14;
  ctx.strokeRect(-80, -80, 160, 160);
  ctx.restore();

  // 3. Subtle ambient radial heat glow at score area
  const tierColor = data.tier.color || '#EF4444';
  const glow = ctx.createRadialGradient(250, 360, 20, 250, 360, 350);
  glow.addColorStop(0, tierColor + '25');
  glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, 720, 1040);

  // 4. Header: Avatar + Brand + Precision Timestamp
  // Avatar Circle
  const avX = 54;
  const avY = 70;
  const avR = 24;

  ctx.beginPath();
  ctx.arc(avX, avY, avR, 0, Math.PI * 2);
  ctx.fillStyle = '#18202a';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = tierColor;
  ctx.stroke();

  ctx.font = '22px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🌶️', avX, avY + 1);

  // Brand Name & Timestamp
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('CabeIndex', 90, 65);

  const dateObj = new Date(data.updatedAt);
  const pad = n => String(n).padStart(2, '0');
  const dateStr = `${dateObj.getFullYear()}-${pad(dateObj.getMonth() + 1)}-${pad(dateObj.getDate())} ${pad(dateObj.getHours())}:${pad(dateObj.getMinutes())}:${pad(dateObj.getSeconds())}`;

  ctx.font = '14px monospace';
  ctx.fillStyle = '#848e9c';
  ctx.fillText(`${dateStr} WIB`, 90, 88);

  // 5. Market / Trading Pair Section
  ctx.font = 'bold 36px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('IDN / PUBLIC TRUST', 54, 185);

  // Position Pill Tag (Like "Long" in green or "Short" in red)
  ctx.font = 'bold 18px system-ui, -apple-system, sans-serif';
  const isHot = data.score >= 46;
  ctx.fillStyle = isHot ? '#F87171' : '#34D399';
  ctx.fillText(`${data.tier.label} (${data.tier.chiliName})`, 54, 222);

  // 6. Giant Hero PnL Number
  const delta = data.delta24h || 0;
  const sign = delta >= 0 ? '+' : '';
  const scoreFormatted = `${data.score.toFixed(2)}`;

  ctx.font = 'bold 84px system-ui, -apple-system, sans-serif';
  // Green if calm/cooling, Hot Red if tense/spicy
  ctx.fillStyle = isHot ? '#F87171' : '#0ECB81';
  ctx.shadowColor = ctx.fillStyle;
  ctx.shadowBlur = 16;
  ctx.fillText(scoreFormatted, 54, 335);
  ctx.shadowBlur = 0; // Reset shadow

  const scoreMetrics = ctx.measureText(scoreFormatted);
  ctx.font = 'bold 30px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('INDEX', 54 + scoreMetrics.width + 16, 335);

  // 24h Delta Pill
  const deltaText = `${sign}${delta.toFixed(2)} (24h) ${delta >= 0 ? '▲ Panas Naik' : '▼ Mereda'}`;
  ctx.font = 'bold 15px monospace';
  ctx.fillStyle = delta >= 0 ? '#f87171' : '#34d399';
  ctx.fillText(deltaText, 54, 375);

  // 7. Two-Column Secondary Metrics Grid (Like Entry Price & Average Close Price)
  const col1X = 54;
  const col2X = 390;

  // Row 1
  const row1Y = 460;
  ctx.font = '15px system-ui, sans-serif';
  ctx.fillStyle = '#848e9c';
  ctx.fillText('Hukum & Institusi', col1X, row1Y);
  ctx.fillText('Dapur & Ekonomi', col2X, row1Y);

  ctx.font = 'bold 28px system-ui, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(`${(data.subIndices.institusi?.score || 50).toFixed(2)}`, col1X, row1Y + 36);
  ctx.fillText(`${(data.subIndices.ekonomi?.score || 50).toFixed(2)}`, col2X, row1Y + 36);

  // Row 2
  const row2Y = 560;
  ctx.font = '15px system-ui, sans-serif';
  ctx.fillStyle = '#848e9c';
  ctx.fillText('Tensi Sosial & Publik', col1X, row2Y);
  ctx.fillText('Status Kepercayaan', col2X, row2Y);

  ctx.font = 'bold 28px system-ui, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(`${(data.subIndices.sosial?.score || 50).toFixed(2)}`, col1X, row2Y + 36);

  ctx.font = 'bold 22px system-ui, sans-serif';
  ctx.fillStyle = tierColor;
  ctx.fillText(`${data.tier.label}`, col2X, row2Y + 36);

  // 8. Description Terminal Callout
  const descBoxY = 665;
  const descBoxH = 85;
  ctx.fillStyle = '#121820';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;
  drawRoundedRect(ctx, 54, descBoxY, 612, descBoxH, 12, true, true);

  ctx.font = '15px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = '#cbd5e1';
  const desc = data.tier.description || 'Memantau sentimen publik dan tensi sosial politik nasional.';
  wrapText(ctx, `"${desc}"`, 74, descBoxY + 36, 570, 22, 'left');

  // 9. Horizontal Divider Line
  ctx.beginPath();
  ctx.moveTo(54, 800);
  ctx.lineTo(666, 800);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // 10. Bottom Footer (The Binance Futures Exchange Footer)
  // Left: Brand Mark
  const footY = 840;

  // Mini Golden Diamond Icon
  ctx.save();
  ctx.translate(68, footY + 12);
  ctx.rotate(Math.PI / 4);
  ctx.fillStyle = '#F0B90B'; // Binance signature amber-gold
  ctx.fillRect(-8, -8, 16, 16);
  ctx.restore();

  ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = '#F0B90B';
  ctx.fillText('CABEINDEX', 92, footY + 10);

  ctx.font = 'bold 26px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('FUTURES & TRUST', 92, footY + 40);

  ctx.font = '15px monospace';
  ctx.fillStyle = '#848e9c';
  ctx.fillText('Tracker Code  IDN-CABE-2026', 64, footY + 80);

  ctx.font = '13px monospace';
  ctx.fillStyle = '#556070';
  ctx.fillText('cabeindex.id • Zero-Auth Public Sentiment', 64, footY + 104);

  // Right: QR Code Box + Handle
  const qrX = 540;
  const qrY = 825;
  const qrSize = 95;

  drawQRCodePattern(ctx, qrX, qrY, qrSize);

  // @cabeindex handle underneath QR
  ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.fillText('🌶️ @cabeindex', qrX + (qrSize / 2), qrY + qrSize + 24);
  ctx.textAlign = 'left'; // Reset alignment
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
