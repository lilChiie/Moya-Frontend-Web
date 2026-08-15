# Moya Frontend Web

Frontend website untuk **Moya**, platform berbasis Artificial Intelligence (AI) yang membantu pemantauan dan pengelolaan kebersihan destinasi wisata melalui dashboard interaktif, sistem monitoring laporan sampah, geo-mapping lokasi, serta pemetaan real-time menggunakan OpenStreetMap.

---


## Tech Stack

- **Vue 3** (Composition API)
- **Quasar Framework v2** (Vite CLI)
- **Pinia** (State Management)
- **Axios** (API Client)
- **OpenStreetMap** (Leaflet & Vue-Leaflet)
- **ApexCharts** (Vue3-ApexCharts)
- **Vite** (Build Tool)

---

## Requirements

- **Node.js**: 18+ / 20+
- **npm**: 8+ / 10+

---

## Installation

### 1. Clone Repository
```bash
git clone https://github.com/lilChiie/Moya-Frontend-Web.git
cd Moya-Frontend-Web
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables (Opsional)
Salin `.env.example` menjadi `.env` jika memerlukan penyesuaian URL backend:
```bash
cp .env.example .env
```
Isi variabel pada `.env`:
```env
VITE_API_BASE_URL=https://a439-103-164-80-87.ngrok-free.app/api
```

---

## Run Project

```bash
npm run dev
```

Frontend berjalan pada:
**[http://localhost:9000](http://localhost:9000)**

---

## Features

- **Authentication & Admin Role Management**: Akses login khusus admin untuk pengelolaan data.
- **Interactive Dashboard Monitoring**: Menampilkan KPI laporan, statistik tren laporan masuk (harian, mingguan, bulanan), serta laporan terbaru.
- **OpenStreetMap Visualization & Geo-Mapping**: Pemetaan *real-time* spot destinasi wisata beserta indikator status kebersihan (Clean / Needs Attention).
- **Report Monitoring System**: Manajemen status laporan sampah.
- **Destination & Master Data Management**: Pengelolaan destinasi wisata, koordinat lokasi, jam operasional, tiket masuk, fasilitas (*Facilities & Amenities*), kategori wisata (*Tourism Types*), dan user ranks.
- **AI Score Visualization**: Visualisasi skor kebersihan AI beserta chip status warna dinamis.
- **Responsive User Interface**: Desain modern, bersih, dan responsif di berbagai perangkat (desktop, tablet, & mobile).

---

## Workflow

1. Admin / Pengguna melakukan **Login**.
2. Pengguna atau masyarakat mengirimkan laporan sampah/kebersihan destinasi wisata.
3. Gambar dan lokasi laporan diproses oleh **AI Detection Backend**.
4. Hasil **AI Score**, status kebersihan, dan laporan terbaru ditampilkan pada **Dashboard** & **Monitoring**.
5. Lokasi dan persebaran spot destinasi ditampilkan pada peta **OpenStreetMap** secara *real-time*.

---

## Deployment (Vercel Ready)

Proyek ini telah dilengkapi dengan file [`vercel.json`](./vercel.json) untuk mendukung *single-page application* (SPA) routing dan proxy rewrite API.

Build untuk produksi:
```bash
npm run build
```
Output folder berada pada: `dist/spa`.

---

## Known Issues

- Membutuhkan backend aktif untuk sinkronisasi data *real-time*.
- Membutuhkan koneksi internet untuk memuat *tile map* OpenStreetMap dan aset eksternal.

---

## License

For **Batam Singapore 2026 Hackathon Submission**.
