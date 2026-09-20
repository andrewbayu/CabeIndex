# 🌶️ CabeIndex — Barometer Tensi Politik & Kepercayaan Publik

> **Seberapa Pedas Kondisi Negara Hari Ini?**  
> CabeIndex adalah dashboard publik tanpa login yang memetakan tensi dinamika sosial-politik, situasi ekonomi dapur rakyat, dan sentimen kepercayaan publik (*public trust*) di Indonesia secara otomatis ke dalam metafora kuliner nusantara: **Skala Kepedasan (Scoville Heat Scale 0 – 100)**.

---

## 🌟 Fitur Utama

- **🔥 The Spiciness Odometer (Tachometer & Maskot Dinamis)**:
  - Gauge setengah lingkaran dengan jarum beranimasi halus (*smooth spring physics*).
  - Maskot cabai yang ekspresinya berubah dinamis sesuai suhu nasional (`😎 Adem Ayem`, `🌶️ Mulai Anget`, `🥵 Pedas Nampol`, `🔥 Geprek Lv 10`, `🌋 Pedas Mampus`).
  - Efek partikel bara api (*ambient embers*) berbasis HTML5 Canvas ringan saat situasi memanas.
- **⚖️ Tiga Pilar Indeks Kepercayaan Publik**:
  - **Hukum & Institusi (Bobot 40%)**: Integritas KPK, DPR, Kementerian, dan Kebijakan Regulasi.
  - **Dapur & Ekonomi (Bobot 35%)**: Harga pangan, inflasi, pajak, dan daya beli masyarakat.
  - **Tensi Sosial & Publik (Bobot 25%)**: Aksi unjuk rasa, petisi publik, dan kebebasan berekspresi.
- **📰 Cabai Rawit Hari Ini (Top Drivers Feed)**:
  - Agregasi 8 berita terpanas yang paling berkontribusi mendongkrak skor kepedasan.
  - Lengkap dengan klasifikasi sentimen (`Kritis`, `Waspada`, `Positif`) dan tautan langsung ke artikel sumber asli (Antara, Tempo, CNN Indonesia, CNBC Indonesia, Detikcom).
- **📈 Grafik Kepedasan (Interactive Trendline)**:
  - Kurva tren 7, 14, dan 30 hari terakhir berbasis SVG interaktif dengan titik tooltip informatif.
- **📸 Viral Share Card Generator**:
  - Generator gambar instan 1200×630px langsung di browser (*client-side canvas*).
  - Tombol 1-klik untuk mengunduh gambar HD atau menyalin teks untuk dibagikan ke WhatsApp dan X (Twitter).
- **📐 Transparansi Metodologi (`methodology.html`)**:
  - Formula perhitungan matematis terbuka demi menjamin netralitas dan independensi data.

---

## 🚀 Memulai (Quick Start)

Karena CabeIndex dibangun dengan prinsip **Zero Framework Baggage** (Pure Vanilla JS, SVG, and CSS):
1. Cukup buka `index.html` langsung di peramban web modern Anda, atau deploy ke GitHub Pages / Vercel / Netlify.
2. Tidak perlu registrasi, tidak perlu login, dan bebas beban server.

### Memperbarui Data Berita (Crawl & Ingestion)
Jalankan skrip agregator RSS resmi (Antara, Tempo, CNN, CNBC):
```bash
node scripts/crawler.mjs
```
Skrip ini akan mengambil headline terkini, menghitung skor 3 pilar, dan memperbarui `data/current.json` serta `data/history.json`.

### Menjalankan Uji Otomatis (Self-Check)
```bash
node scripts/test-pipeline.mjs
```

---

## 📂 Struktur Berkas

```
├── index.html               # Halaman utama publik
├── style.css                # Desain sistem gelap & responsif
├── app.js                   # Engine fisika jarum SVG, chart, dan share card generator
├── methodology.html         # Dokumen transparansi rumus & sumber data
├── data/
│   ├── current.json         # Snapshot data indeks terbaru
│   └── history.json         # Data riwayat 30 hari terakhir
└── scripts/
    ├── crawler.mjs          # Worker RSS penarik berita nasional
    ├── scorer.mjs           # Mesin kalkulator sentimen & Scoville Index
    └── test-pipeline.mjs    # Skrip pengujian otomatis mandiri
```

---

## 🛡️ Lisensi & Netralitas
CabeIndex adalah proyek agregasi data publik independen. Seluruh kutipan berita sepenuhnya merupakan hak cipta media penerbit yang bersangkutan.
