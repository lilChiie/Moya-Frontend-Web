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
VITE_API_BASE_URL=https://coronary-moonstone-grain.ngrok-free.dev/api
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

- **Authentication & Admin Role Management**: Dedicated admin login access for secure data management.
- **Interactive Dashboard Monitoring**: Displays report KPIs, incoming report volume trends (daily, weekly, monthly), and latest activity feeds.
- **OpenStreetMap Geo-Mapping**: Real-time interactive map of tourism destinations with cleanliness status indicators (Safe / Needs Attention / Needs Handling).
- **Waste Report Monitoring System**: Detailed waste report inspection and lifecycle handling (Pending / Resolved) grouped by tourism destinations.
- **Clean Reports Verification System**: Review and verify/reject clean condition proofs submitted by mobile users with admin notes, establishing a verification baseline for monitoring.
- **Destination & Master Data Management**: Comprehensive management of tourism destinations, location coordinates, operating hours, ticket pricing, Facilities, Tourism Types, and User Rank tiers.
- **AI Score Visualization**: Automated cleanliness classification scores and detection summaries powered by AI.
- **Responsive User Interface**: Modern, clean, and responsive design across desktop, tablet, and mobile devices.

---

## Workflow

1. Admin logs in to the web management portal.
2. Mobile users submit waste reports with photos processed by the **AI Detection Backend**.
3. **AI Cleanliness Scores** and report statistics update automatically on the **Dashboard** and **Monitoring** pages.
4. Spot locations and distribution of destinations are mapped on **OpenStreetMap** in real time with dynamic status indicators.
5. Community members/volunteers submit clean condition proofs via mobile once an area is cleaned.
6. Admin reviews submissions in **Clean Reports** (Approve / Reject) or navigates to **Monitoring** to resolve pending waste reports.
7. Resolving reports restores the destination's cleanliness rating, directly boosting its recommendation ranking in the mobile app's **DSS (Decision Support System)** algorithm.

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
