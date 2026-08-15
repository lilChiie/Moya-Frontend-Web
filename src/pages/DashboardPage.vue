<template>
  <q-page class="q-pa-lg bg-grey-2">
    <div class="max-width-container">
      <div class="row items-center justify-between q-mb-lg">
        <div>
          <h1 class="text-h4 text-weight-bold text-grey-9 q-ma-none font-header">
            Welcome, Admin
          </h1>
          <p class="text-subtitle1 text-grey-7 q-mt-xs q-mb-none font-subtitle">
            Batam Tourism Real-Time Cleanliness Monitoring & Report Center
          </p>
        </div>

        <div class="kpi-card row items-center justify-between q-pa-md">
          <div class="column justify-center">
            <span class="kpi-label">Incoming Reports</span>
            <span class="kpi-value">6</span>
          </div>
          <div class="kpi-icon-wrapper flex flex-center">
            <q-icon name="show_chart" size="24px" color="white" />
          </div>
        </div>
      </div>

      <q-card flat class="map-card q-pa-md q-mb-lg">
        <div class="text-h6 text-weight-bold text-grey-9 q-mb-md">Real-time Map</div>
        <div id="realtime-map" class="map-container"></div>
      </q-card>

      <div class="row q-col-gutter-lg">
        <div class="col-12 col-md-7">
          <q-card flat class="dashboard-card q-pa-md fill-height">
            <div class="row items-center justify-between q-mb-xs">
              <div class="row items-center q-gutter-x-sm">
                <span class="text-h6 text-weight-bold text-grey-9">Incoming Reports Trend</span>
                <q-chip
                  dense
                  class="bg-blue-1 text-primary text-weight-bold q-px-sm font-chip"
                  icon="trending_up"
                >
                  +100% Upward Trend
                </q-chip>
              </div>

              <div class="row q-gutter-x-xs filter-tabs bg-grey-3 q-pa-xs border-radius-sm">
                <button
                  v-for="tab in filterTabs"
                  :key="tab"
                  @click="activeFilter = tab"
                  :class="['filter-btn', { active: activeFilter === tab }]"
                >
                  {{ tab }}
                </button>
              </div>
            </div>

            <p class="text-caption text-grey-6 q-mb-md">Fluctuation in cleanliness report volume</p>

            <div class="chart-container">
              <apexchart
                type="line"
                height="280"
                :options="chartOptions"
                :series="chartSeries"
              ></apexchart>
            </div>
          </q-card>
        </div>

        <div class="col-12 col-md-5">
          <q-card flat class="dashboard-card q-pa-md fill-height">
            <div class="row items-center justify-between q-mb-md">
              <span class="text-h6 text-weight-bold text-grey-9">Latest Reports</span>
              <router-link to="/admin/monitoring" class="text-primary text-weight-bold text-caption flex items-center no-underline">
                View All
                <q-icon name="chevron_right" size="18px" class="q-ml-xs" />
              </router-link>
            </div>

            <div class="column q-gutter-y-sm">
              <div
                v-for="(item, index) in recentReports"
                :key="index"
                class="report-item row items-center justify-between q-pa-sm rounded-borders hover-shadow"
              >
                <div class="row items-center q-gutter-x-sm">
                  <div class="img-wrapper">
                    <img :src="item.image" :alt="item.title" class="report-img" />
                  </div>
                  <div class="column justify-center">
                    <div class="ai-score-badge q-mb-xs">
                      AI Score: {{ item.aiScore }}
                    </div>
                    <span class="text-weight-bold text-subtitle2 text-grey-9 leading-tight">
                      {{ item.title }}
                    </span>
                    <span class="text-caption text-grey-6" style="font-size: 11px;">
                      {{ item.timestamp }}
                    </span>
                  </div>
                </div>

                <div class="row items-center q-gutter-x-xs">
                  <span
                    class="status-dot"
                    :style="{ backgroundColor: item.statusColor }"
                  ></span>
                  <span
                    class="text-weight-bold"
                    :style="{ color: item.statusColor, fontSize: '12px' }"
                  >
                    {{ item.status }}
                  </span>
                </div>
              </div>
            </div>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import apexchart from 'vue3-apexcharts'

import report1Img from 'assets/report1.jpg'
import report2Img from 'assets/report2.jpg'

let map = null

const filterTabs = ['Daily', 'Weekly', 'Monthly']
const activeFilter = ref('Weekly')

const chartSeries = ref([
  {
    name: 'Report Volume',
    data: [0, 0, 0, 0, 0, 0, 6],
  },
])

const chartOptions = ref({
  chart: {
    type: 'line',
    toolbar: { show: false },
    fontFamily: 'Inter, Roboto, sans-serif',
  },
  colors: ['#7D9240'],
  stroke: {
    curve: 'smooth',
    width: 3.5,
  },
  markers: {
    size: 6,
    colors: ['#7D9240'],
    strokeColors: '#ffffff',
    strokeWidth: 2.5,
    hover: { size: 8 },
  },
  dataLabels: {
    enabled: true,
    background: {
      enabled: true,
      foreColor: '#ffffff',
      padding: 4,
      borderRadius: 4,
      borderWidth: 1,
      borderColor: '#7D9240',
      opacity: 0.9,
    },
    style: {
      fontSize: '11px',
      fontWeight: 'bold',
      colors: ['#7D9240'],
    },
    offsetY: -8,
  },
  xaxis: {
    categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    axisBorder: { show: false },
    axisTicks: { show: false },
    labels: {
      style: { colors: '#64748B', fontWeight: 500, fontSize: '12px' },
    },
  },
  yaxis: {
    min: 0,
    max: 100,
    tickAmount: 4,
    labels: {
      style: { colors: '#94A3B8', fontSize: '11px' },
    },
  },
  grid: {
    borderColor: '#F1F5F9',
    strokeDashArray: 4,
  },
  tooltip: {
    theme: 'light',
  },
})

const recentReports = ref([
  {
    title: 'Bukit Holbung',
    aiScore: '0.5',
    timestamp: '2/8/2026, 17.37.50',
    status: 'Needs Attention',
    statusColor: '#F59E0B',
    image: report1Img,
  },
  {
    title: 'Welcome to Batam',
    aiScore: '0.5',
    timestamp: '2/8/2026, 15.07.02',
    status: 'Needs Attention',
    statusColor: '#F59E0B',
    image: report1Img,
  },
  {
    title: 'Pantai Batu Hoda',
    aiScore: '0.5',
    timestamp: '2/8/2026, 15.03.53',
    status: 'Needs Attention',
    statusColor: '#F59E0B',
    image: report1Img,
  },
  {
    title: 'Jembatan Barelang',
    aiScore: '0.1',
    timestamp: '2/8/2026, 14.52.03',
    status: 'Clean',
    statusColor: '#7D9240',
    image: report2Img,
  },
])

const batamBoundaryCoordinates = [
  [1.18, 103.9],
  [1.2, 104.16],
  [1.08, 104.22],
  [0.85, 104.18],
  [0.72, 104.12],
  [0.72, 104.05],
  [0.88, 103.95],
  [1.05, 103.88],
]

const locationMarkers = [
  {
    name: 'Jembatan Barelang',
    status: 'Clean',
    color: '#7D9240',
    lat: 0.9855,
    lng: 104.0415,
  },
  {
    name: 'Pantai Nongsa',
    status: 'Clean',
    color: '#7D9240',
    lat: 1.1895,
    lng: 104.104,
  },
  {
    name: 'Nagoya Hill',
    status: 'Clean',
    color: '#7D9240',
    lat: 1.144,
    lng: 104.015,
  },
  {
    name: 'Pantai Melayu',
    status: 'Needs Attention',
    color: '#F59E0B',
    lat: 0.942,
    lng: 104.062,
  },
  {
    name: 'Welcome to Batam',
    status: 'Needs Attention',
    color: '#F59E0B',
    lat: 1.1275,
    lng: 104.0535,
  },
]

const createCustomMarkerIcon = (status, name, color) => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div class="marker-wrapper">
        <div class="marker-pin" style="background-color: ${color};">
          <div class="marker-pin-inner"></div>
        </div>
        <div class="marker-badge">
          <span class="marker-status" style="color: ${color};">${status}</span>
          <span class="marker-separator">-</span>
          <span class="marker-name">${name}</span>
        </div>
      </div>
    `,
    iconSize: [220, 42],
    iconAnchor: [16, 21],
  })
}

onMounted(() => {
  map = L.map('realtime-map', {
    center: [1.06, 104.04],
    zoom: 11,
    zoomControl: true,
  })

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(map)

  L.polygon(batamBoundaryCoordinates, {
    color: '#EF4444',
    weight: 2,
    fillColor: '#EF4444',
    fillOpacity: 0.05,
  }).addTo(map)

  locationMarkers.forEach((loc) => {
    const customIcon = createCustomMarkerIcon(loc.status, loc.name, loc.color)
    L.marker([loc.lat, loc.lng], { icon: customIcon }).addTo(map)
  })
})

onUnmounted(() => {
  if (map) {
    map.remove()
  }
})
</script>

<style scoped lang="scss">
.max-width-container {
  max-width: 1400px;
  margin: 0 auto;
}

.font-header {
  font-size: 1.85rem;
  line-height: 1.2;
}

.font-subtitle {
  font-size: 0.95rem;
}

.kpi-card {
  background: linear-gradient(135deg, #7D9240 0%, #5F702E 100%);
  border-radius: 16px;
  min-width: 210px;
  box-shadow: 0 6px 20px rgba(125, 146, 64, 0.25);
}

.kpi-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #e2e8f0;
}

.kpi-value {
  font-size: 2.2rem;
  font-weight: 800;
  color: #ffffff;
  line-height: 1;
}

.kpi-icon-wrapper {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background-color: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(4px);
  margin-left: 16px;
}

.map-card {
  border-radius: 16px;
  background-color: #ffffff;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  border: 1px solid #e2e8f0;
}

.map-container {
  width: 100%;
  height: 380px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
}

.dashboard-card {
  border-radius: 16px;
  background-color: #ffffff;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  border: 1px solid #e2e8f0;
}

.fill-height {
  height: 100%;
}

.font-chip {
  font-size: 11px;
}

.filter-tabs {
  border-radius: 8px;
}

.filter-btn {
  background: transparent;
  border: none;
  font-size: 12px;
  font-weight: 500;
  color: #64748b;
  padding: 4px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;

  &.active {
    background-color: #ffffff;
    color: #0f172a;
    font-weight: 700;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
}

.report-item {
  border: 1px solid #f1f5f9;
  transition: all 0.2s ease;

  &:hover {
    background-color: #f8fafc;
    border-color: #cbd5e1;
  }
}

.img-wrapper {
  width: 80px;
  height: 56px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.report-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.ai-score-badge {
  background-color: #fee2e2;
  color: #ef4444;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
  display: inline-block;
  width: fit-content;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.leading-tight {
  line-height: 1.25;
}

.no-underline {
  text-decoration: none;
}
</style>

<style lang="scss">
.custom-leaflet-marker {
  background: transparent;
  border: none;
}

.marker-wrapper {
  display: flex;
  align-items: center;
  position: relative;
  cursor: pointer;
}

.marker-pin {
  width: 32px;
  height: 32px;
  border-radius: 50% 50% 50% 0;
  transform: rotate(-45deg);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.25);
  border: 2.5px solid #ffffff;
  flex-shrink: 0;
}

.marker-pin-inner {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #ffffff;
  transform: rotate(45deg);
}

.marker-badge {
  background-color: #ffffff;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  margin-left: 8px;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.12);
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 4px;
}

.marker-status {
  font-weight: 700;
}

.marker-separator {
  color: #94a3b8;
}

.marker-name {
  color: #334155;
}
</style>
