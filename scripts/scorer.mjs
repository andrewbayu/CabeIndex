/**
 * CabeIndex Scoring Engine
 * Evaluates Indonesian news headlines & snippets across 3 pillars:
 * 1. Institusi & Hukum (40%)
 * 2. Ekonomi & Daya Beli (35%)
 * 3. Tensi Sosial & Publik (25%)
 * 
 * Outputs a 0-100 Scoville Heat Index for the nation.
 */

export const TIERS = [
  {
    min: 0,
    max: 20,
    id: 'adem',
    label: 'Adem Ayem',
    chiliName: 'Paprika Manis',
    color: '#10B981', // Emerald
    badgeBg: 'rgba(16, 185, 129, 0.15)',
    description: 'Sentimen publik sangat tenang, tensi politik stabil, dan kepercayaan publik tinggi.',
    mascot: 'relaxed'
  },
  {
    min: 21,
    max: 45,
    id: 'anget',
    label: 'Mulai Anget',
    chiliName: 'Cabe Merah Keriting',
    color: '#F59E0B', // Amber
    badgeBg: 'rgba(245, 158, 11, 0.15)',
    description: 'Dinamika kebijakan dan pro-kontra wajar, perhatian publik mulai terpecah.',
    mascot: 'smirk'
  },
  {
    min: 46,
    max: 70,
    id: 'nampol',
    label: 'Pedas Nampol',
    chiliName: 'Cabe Rawit Merah',
    color: '#EF4444', // Red
    badgeBg: 'rgba(239, 68, 68, 0.15)',
    description: 'Sorotan tajam terhadap institusi, tekanan ekonomi terasa, dan kritik netizen menguat.',
    mascot: 'sweating'
  },
  {
    min: 71,
    max: 85,
    id: 'geprek',
    label: 'Geprek Level 10',
    chiliName: 'Ghost Pepper',
    color: '#DC2626', // Deep Crimson
    badgeBg: 'rgba(220, 38, 38, 0.2)',
    description: 'Ketidakpuasan publik masif, skandal besar mencuat, mosi tidak percaya menyebar.',
    mascot: 'screaming'
  },
  {
    min: 86,
    max: 100,
    id: 'mampus',
    label: 'Pedas Mampus',
    chiliName: 'Carolina Reaper',
    color: '#9333EA', // Volcanic purple-red
    badgeBg: 'rgba(147, 51, 234, 0.25)',
    description: 'Kondisi krisis kepercayaan ekstrem, turbulensi kebijakan luar biasa, situasi genting.',
    mascot: 'volcanic'
  }
];

export function getTier(score) {
  const bounded = Math.max(0, Math.min(100, score));
  return TIERS.find(t => bounded >= t.min && bounded <= t.max) || TIERS[TIERS.length - 1];
}

// Lexicons for Indonesian socio-political & economic context
const HOT_KEYWORDS = {
  institusi: {
    negative: [
      'korupsi', 'suap', 'ott', 'tersangka', 'kpk', 'dpr', 'skandal', 'vonis ringan',
      'pungli', 'mafia', 'gratifikasi', 'penyelewengan', 'nepotisme', 'pelanggaran',
      'kekecewaan', 'dinasti', 'pembatalan', 'polemik', 'bobrok'
    ],
    positive: [
      'transparan', 'reformasi', 'penangkapan', 'prestasi', 'penegakan hukum', 'integritas',
      'bersih', 'akuntabel', 'pemulihan aset', 'apresiasi'
    ]
  },
  ekonomi: {
    negative: [
      'inflasi', 'beras mahal', 'phk', 'daya beli lesu', 'pajak naik', 'subsidi dicabut',
      'kelangkaan', 'utang membengkak', 'rupiah melemah', 'kemiskinan', 'stagnan',
      'sengsara', 'pengangguran', 'tarif naik'
    ],
    positive: [
      'pertumbuhan', 'surplus', 'investasi', 'lapangan kerja baru', 'bantuan cair',
      'deflasi terkendali', 'rupiah menguat', 'ekspor naik', 'stabilitas harga', 'bansos tepat'
    ]
  },
  sosial: {
    negative: [
      'demo', 'unjuk rasa', 'protes', 'pemogokan', 'kericuhan', 'petisi', 'boikot',
      'ancaman', 'kebebasan dibungkam', 'kriminalisasi', 'bentrok', 'kekecewaan publik',
      'kemarahan netizen', 'trending kecam'
    ],
    positive: [
      'gotong royong', 'kondusif', 'damai', 'apresiasi publik', 'solidaritas', 'prestasi atlet',
      'karya anak bangsa', 'rukun', 'dialog terbuka'
    ]
  }
};

/**
 * Score an individual article text (0-100: higher = hotter / higher tension / lower public trust)
 */
export function scoreArticle(title, snippet = '') {
  const text = `${title} ${snippet}`.toLowerCase();
  
  let pillarScores = { institusi: 50, ekonomi: 50, sosial: 50 };
  let primaryCategory = 'sosial';
  let maxMatches = 0;

  for (const [pillar, lex] of Object.entries(HOT_KEYWORDS)) {
    let negCount = 0;
    let posCount = 0;

    lex.negative.forEach(kw => {
      if (text.includes(kw)) negCount++;
    });
    lex.positive.forEach(kw => {
      if (text.includes(kw)) posCount++;
    });

    const matches = negCount + posCount;
    if (matches > maxMatches) {
      maxMatches = matches;
      primaryCategory = pillar;
    }

    // Default neutral base is 50. Negative words push score UP (hotter, less trust). Positive words push score DOWN (cooler, more trust).
    const delta = (negCount * 12) - (posCount * 10);
    pillarScores[pillar] = Math.max(10, Math.min(95, 50 + delta));
  }

  const overallHeat = Math.round(
    (pillarScores.institusi * 0.40) +
    (pillarScores.ekonomi * 0.35) +
    (pillarScores.sosial * 0.25)
  );

  let sentiment = 'netral';
  if (overallHeat >= 65) sentiment = 'kritis';
  else if (overallHeat >= 50) sentiment = 'waspada';
  else if (overallHeat <= 35) sentiment = 'positif';

  return {
    heatScore: overallHeat,
    category: primaryCategory,
    sentiment,
    pillarScores
  };
}

/**
 * Calculate National Index from an array of articles
 */
export function calculateNationalIndex(articles, previousScore = 65.5) {
  if (!articles || articles.length === 0) {
    return {
      score: 50.0,
      tier: getTier(50.0),
      delta24h: 0,
      subIndices: {
        institusi: { score: 50, delta: 0, label: 'Hukum & Institusi' },
        ekonomi: { score: 50, delta: 0, label: 'Dapur & Ekonomi' },
        sosial: { score: 50, delta: 0, label: 'Tensi Sosial' }
      },
      topDrivers: []
    };
  }

  let totalInstitusi = 0;
  let totalEkonomi = 0;
  let totalSosial = 0;

  const scoredArticles = articles.map(art => {
    const scored = scoreArticle(art.title, art.snippet);
    totalInstitusi += scored.pillarScores.institusi;
    totalEkonomi += scored.pillarScores.ekonomi;
    totalSosial += scored.pillarScores.sosial;
    return { ...art, ...scored };
  });

  const n = articles.length;
  const avgInstitusi = Math.round(totalInstitusi / n);
  const avgEkonomi = Math.round(totalEkonomi / n);
  const avgSosial = Math.round(totalSosial / n);

  // Overall National Heat Score
  const rawScore = (avgInstitusi * 0.40) + (avgEkonomi * 0.35) + (avgSosial * 0.25);
  const score = Math.round(rawScore * 10) / 10; // 1 decimal place
  const delta24h = Math.round((score - previousScore) * 10) / 10;

  // Sort top drivers by highest heat score (most burning topics)
  const topDrivers = [...scoredArticles]
    .sort((a, b) => b.heatScore - a.heatScore)
    .slice(0, 8);

  return {
    score,
    tier: getTier(score),
    delta24h,
    updatedAt: new Date().toISOString(),
    articlesAnalyzed: n,
    subIndices: {
      institusi: {
        score: avgInstitusi,
        label: 'Hukum & Institusi',
        desc: 'Integritas KPK, DPR, Kementerian, dan Kebijakan Regulasi',
        weight: '40%'
      },
      ekonomi: {
        score: avgEkonomi,
        label: 'Dapur & Ekonomi',
        desc: 'Harga Pangan, Inflasi, Pajak, dan Lapangan Pekerjaan',
        weight: '35%'
      },
      sosial: {
        score: avgSosial,
        label: 'Tensi Sosial & Publik',
        desc: 'Aksi Massa, Petisi Publik, dan Sentimen Percakapan Sipil',
        weight: '25%'
      }
    },
    topDrivers
  };
}
