# Moya Frontend Web

Frontend website for **Moya**, an Artificial Intelligence (AI) powered platform that helps monitor and manage tourism destination cleanliness through an interactive dashboard, waste report monitoring system, location geo-mapping, and real-time mapping using OpenStreetMap.

---

## Repositories

- **Backend Repository**: [https://github.com/lilChiie/Moya-Backend.git](https://github.com/lilChiie/Moya-Backend.git)
- **Frontend Mobile Repository**: [https://github.com/lilChiie/Moya-Frontend-Mobile.git](https://github.com/lilChiie/Moya-Frontend-Mobile.git)
- **Frontend Web Repository**: [https://github.com/lilChiie/Moya-Frontend-Web.git](https://github.com/lilChiie/Moya-Frontend-Web.git)

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

### 3. Setup Environment Variables (Optional)
Copy `.env.example` to `.env` if you need backend URL customization:
```bash
cp .env.example .env
```
Set the variable in `.env`:
```env
VITE_API_BASE_URL=https://a439-103-164-80-87.ngrok-free.app/api
```

---

## Run Project

```bash
npm run dev
```

Frontend runs on:
**[http://localhost:9000](http://localhost:9000)**

---

## Features

- **Authentication & Admin Role Management**: Dedicated admin login access for data management.
- **Interactive Dashboard Monitoring**: Displays report KPIs, incoming report trend statistics (daily, weekly, monthly), and latest reports.
- **OpenStreetMap Visualization & Geo-Mapping**: Real-time mapping of tourism destination spots with cleanliness status indicators (Clean / Needs Attention).
- **Report Monitoring System**: Waste report status management.
- **Destination & Master Data Management**: Management of tourism destinations, location coordinates, operating hours, ticket prices, Facilities, Tourism Types, and User Ranks.
- **AI Score Visualization**: AI cleanliness score visualization with dynamic status color badges.
- **Responsive User Interface**: Modern, clean, and responsive design across desktop, tablet, and mobile devices.

---

## Workflow

1. Admin / User logs in to the system.
2. Users or the public submit waste/cleanliness reports for tourism destinations.
3. Report image and location are processed by the **AI Detection Backend**.
4. **AI Score**, cleanliness status, and latest reports are displayed on the **Dashboard** & **Monitoring** page.
5. Spot locations and distribution of destinations are displayed on the **OpenStreetMap** in real time.

---

## Deployment (Vercel Ready)

This project includes a [`vercel.json`](./vercel.json) file to support single-page application (SPA) history routing and API proxy rewrites.

Production build:
```bash
npm run build
```
Output folder is located at: `dist/spa`.

---

## Known Issues

- Requires an active backend server for real-time data synchronization.
- Requires an active internet connection to load OpenStreetMap tiles and external assets.

---

## License

For **Batam Singapore 2026 Hackathon Submission**.
