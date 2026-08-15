<template>
  <q-page class="page-container bg-grey-2">
    <div class="max-width-container">
      <div class="row items-center justify-between q-mb-lg header-row">
        <div class="col-12 col-sm-auto q-mb-sm-res">
          <h1 class="text-weight-bold text-grey-9 q-ma-none font-header">Welcome, Admin</h1>
          <p class="text-grey-7 q-mt-xs q-mb-none font-subtitle">
            Batam Tourism Real-Time Cleanliness Monitoring & Report Center
          </p>
        </div>

        <div class="kpi-card row items-center justify-between q-pa-md col-12 col-sm-auto">
          <div class="column justify-center">
            <span class="kpi-label">Incoming Reports</span>
            <span class="kpi-value">{{ incomingReportsCount }}</span>
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
                  {{ currentTrendLabel }}
                </q-chip>
              </div>

              <div
                class="row q-gutter-x-xs filter-tabs bg-grey-3 q-pa-xs border-radius-sm q-mt-xs-res"
              >
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

            <div class="chart-container relative-position">
              <q-inner-loading :showing="isLoadingTrend">
                <q-spinner-dots size="36px" color="primary" />
              </q-inner-loading>
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
          <q-card flat class="dashboard-card q-pa-md fill-height relative-position">
            <q-inner-loading :showing="isLoadingLatest">
              <q-spinner-dots size="36px" color="primary" />
            </q-inner-loading>
            <div class="row items-center justify-between q-mb-md">
              <span class="text-h6 text-weight-bold text-grey-9">Latest Reports</span>
              <router-link
                to="/admin/monitoring"
                class="text-primary text-weight-bold text-caption flex items-center no-underline"
              >
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
                    <div
                      :class="[
                        'ai-score-badge',
                        'q-mb-xs',
                        Number(item.aiScore) >= 0.5
                          ? 'bg-red-1 text-negative'
                          : 'bg-green-1 text-positive',
                      ]"
                    >
                      AI Score: {{ item.aiScore }}
                    </div>
                    <span class="text-weight-bold text-subtitle2 text-grey-9 leading-tight">
                      {{ item.title }}
                    </span>
                    <span class="text-caption text-grey-6" style="font-size: 11px">
                      {{ item.timestamp }}
                    </span>
                  </div>
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
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { api } from 'boot/axios'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import apexchart from 'vue3-apexcharts'

import report1Img from 'assets/report1.jpg'

let map = null

const filterTabs = ['Daily', 'Weekly', 'Monthly']
const activeFilter = ref('Daily')

const defaultCategories = {
  Daily: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  Weekly: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
  Monthly: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
}

const currentTrendLabel = ref('')
const isLoadingTrend = ref(false)

const chartSeries = ref([
  {
    name: 'Report Volume',
    data: [],
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
    categories: defaultCategories.Daily,
    axisBorder: { show: false },
    axisTicks: { show: false },
    labels: {
      style: { colors: '#64748B', fontWeight: 500, fontSize: '12px' },
    },
  },
  yaxis: {
    min: 0,
    max: 50,
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

async function fetchTrendData(filterName) {
  const period = filterName ? filterName.toLowerCase() : 'daily'

  isLoadingTrend.value = true
  try {
    let res
    try {
      res = await api.get(`/reports/trend?period=${period}`)
    } catch {
      try {
        res = await api.get(`/reports/trend/?period=${period}`)
      } catch {
        res = await api.get('/reports/trend/', { params: { period } })
      }
    }

    const resData = res.data?.data || res.data || {}
    let categories = []
    let dataValues = []

    if (Array.isArray(resData)) {
      categories = resData
        .map(
          (item) =>
            item.label ||
            item.day ||
            item.date ||
            item.week ||
            item.month ||
            item.period ||
            item.name ||
            '',
        )
        .filter(Boolean)
      dataValues = resData.map(
        (item) => item.count ?? item.total ?? item.value ?? item.reports ?? item.volume ?? 0,
      )
    } else if (typeof resData === 'object') {
      categories = resData.categories || resData.labels || resData.dates || resData.days || []
      dataValues = resData.data || resData.series || resData.counts || resData.values || []

      if (Array.isArray(resData.series) && resData.series.length > 0 && resData.series[0].data) {
        dataValues = resData.series[0].data
      }
    }

    if (categories.length === 0) {
      categories = defaultCategories[filterName] || defaultCategories.Daily
    }

    if (dataValues.length === 0) {
      dataValues = categories.map(() => 0)
    }

    const maxVal = dataValues.length > 0 ? Math.max(...dataValues, 10) : 10
    const calculatedMaxY = Math.ceil((maxVal * 1.25) / 10) * 10

    currentTrendLabel.value =
      resData.trend || resData.trend_label || resData.percentage || `+${period} trend`
    chartSeries.value = [
      {
        name: 'Report Volume',
        data: dataValues,
      },
    ]
    chartOptions.value = {
      ...chartOptions.value,
      xaxis: {
        ...chartOptions.value.xaxis,
        categories: categories,
      },
      yaxis: {
        ...chartOptions.value.yaxis,
        max: calculatedMaxY,
      },
    }
  } catch (err) {
    console.error(`Failed to fetch trend data for period=${period}:`, err)
    const fallbackCategories = defaultCategories[filterName] || defaultCategories.Daily
    chartSeries.value = [{ name: 'Report Volume', data: [] }]
    chartOptions.value = {
      ...chartOptions.value,
      xaxis: { ...chartOptions.value.xaxis, categories: fallbackCategories },
    }
  } finally {
    isLoadingTrend.value = false
  }
}

watch(
  activeFilter,
  (newFilter) => {
    fetchTrendData(newFilter)
  },
  { immediate: true },
)

const isLoadingLatest = ref(false)
const recentReports = ref([])
const destinationList = ref([])
const incomingReportsCount = ref(0)

async function fetchDestinationsForDashboard() {
  try {
    let res
    try {
      res = await api.get('/destinations/')
    } catch {
      res = await api.get('/destinations')
    }
    const raw = res.data?.data || res.data || []
    destinationList.value = Array.isArray(raw) ? raw : []
  } catch (e) {
    console.error('Failed to fetch destinations list for dashboard:', e)
  }
}

async function fetchTotalReportsCount() {
  try {
    let res
    try {
      res = await api.get('/reports/')
    } catch {
      res = await api.get('/reports')
    }
    const raw = res.data?.data || res.data || []
    const list = Array.isArray(raw) ? raw : []
    const count = res.data?.total ?? res.data?.count ?? list.length
    incomingReportsCount.value = count
  } catch (e) {
    console.error('Failed to fetch total reports count:', e)
  }
}

function formatDashboardDate(dateStr) {
  if (!dateStr || dateStr === '-') return '-'
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    return `${day}/${month}/${year}`
  } catch {
    return dateStr
  }
}

const ACTIVE_NGROK_HOST = 'https://coronary-moonstone-grain.ngrok-free.dev'

function formatDashboardImage(url) {
  if (!url || typeof url !== 'string') return report1Img
  if (url.startsWith('data:image/')) return url

  let cleanUrl = url.trim()

  if (cleanUrl.includes('/static/')) {
    const staticPath = cleanUrl.substring(cleanUrl.indexOf('/static/'))
    const sep = staticPath.includes('?') ? '&' : '?'
    return `${staticPath}${sep}ngrok-skip-browser-warning=true`
  }

  if (cleanUrl.includes('ngrok-free.app') || cleanUrl.includes('ngrok-free.dev') || cleanUrl.includes('ngrok.io')) {
    cleanUrl = cleanUrl.replace(/^https?:\/\/[^/]+/, ACTIVE_NGROK_HOST)
  }

  if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
    const sep = cleanUrl.includes('?') ? '&' : '?'
    return `${cleanUrl}${sep}ngrok-skip-browser-warning=true`
  }

  const path = cleanUrl.startsWith('/') ? cleanUrl : `/${cleanUrl}`
  const sep = path.includes('?') ? '&' : '?'
  return `${path}${sep}ngrok-skip-browser-warning=true`
}

function resolveDashboardLocation(item) {
  let locationName =
    item.destination_name || item.destination?.name || item.location || item.name || ''

  if (!locationName && item.destination_id) {
    const foundDest = destinationList.value.find(
      (d) => (d.id || d.destination_id) == item.destination_id,
    )
    if (foundDest) {
      locationName = foundDest.name || foundDest.destination_name || foundDest.title || ''
    }
  }

  if (!locationName && item.destination_id) {
    locationName = `Destination #${item.destination_id}`
  }

  return locationName || 'Tourism Destination'
}

async function fetchLatestReports() {
  isLoadingLatest.value = true
  try {
    let res
    try {
      res = await api.get('/reports/latest')
    } catch {
      try {
        res = await api.get('/reports/latest/')
      } catch {
        res = await api.get('/reports/')
      }
    }

    const rawData = res.data?.data || res.data || []
    const list = Array.isArray(rawData) ? rawData : []
    const totalVal = res.data?.total ?? res.data?.count ?? res.data?.total_reports ?? list.length
    if (totalVal > 0 && incomingReportsCount.value === 0) {
      incomingReportsCount.value = totalVal
    }

    recentReports.value = list.map((item) => {
      const scoreVal = item.score ?? item.ai_score ?? item.aiScore ?? '0'
      const statusStr = String(item.status || '').toLowerCase()
      const isClean = statusStr === 'resolved' || statusStr === 'handled' || statusStr === 'clean'

      return {
        id: item.id,
        title: resolveDashboardLocation(item),
        aiScore: scoreVal,
        timestamp: formatDashboardDate(
          item.created_at || item.timestamp || item.reported_at || '-',
        ),
        status: isClean ? 'Clean' : 'Needs Attention',
        statusColor: isClean ? '#7D9240' : '#F59E0B',
        image: formatDashboardImage(item.image_url || item.image || item.photo),
      }
    })
  } catch (err) {
    console.error('Failed to fetch latest reports from /api/reports/latest:', err)
  } finally {
    isLoadingLatest.value = false
  }
}

const isLoadingSpots = ref(false)
const mapSpots = ref([])
const mapMarkersLayerGroup = ref(null)

async function fetchSpots() {
  isLoadingSpots.value = true
  try {
    let res
    try {
      res = await api.get('/spots/')
    } catch {
      try {
        res = await api.get('/spots')
      } catch {
        res = await api.get('/spot')
      }
    }

    const rawData = res.data?.data || res.data || []
    const list = Array.isArray(rawData) ? rawData : []

    mapSpots.value = list.map((item) => {
      const lat = item.latitude ?? (Array.isArray(item.coords) ? item.coords[0] : 1.06)
      const lng = item.longitude ?? (Array.isArray(item.coords) ? item.coords[1] : 104.04)
      const statusRaw = String(item.cleanliness_status || item.status || '').toLowerCase()
      const laporanCount = Number(item.laporanCount ?? item.laporan_count ?? 0)
      const isClean =
        (statusRaw === 'safe' || statusRaw === 'aman' || statusRaw === 'clean') && laporanCount === 0

      const statusLabel = isClean ? 'Clean' : 'Needs Attention'
      const statusColor = isClean ? '#7D9240' : '#F59E0B'

      return {
        id: item.id,
        name: item.name || 'Tourism Spot',
        lat: Number(lat),
        lng: Number(lng),
        status: statusLabel,
        color: statusColor,
        laporanCount: laporanCount,
        image: formatDashboardImage(item.image_url || item.img || item.image),
        description: item.description || '',
        score: item.cleanliness_score ?? 0,
      }
    })
  } catch (err) {
    console.error('Failed to fetch spots from /api/spots:', err)
    mapSpots.value = []
  } finally {
    isLoadingSpots.value = false
  }
}

function renderMapSpots() {
  if (!map) return

  if (mapMarkersLayerGroup.value) {
    mapMarkersLayerGroup.value.clearLayers()
  } else {
    mapMarkersLayerGroup.value = L.layerGroup().addTo(map)
  }

  const spotsToRender = mapSpots.value.length > 0 ? mapSpots.value : locationMarkers

  const bounds = []

  spotsToRender.forEach((loc) => {
    if (!loc.lat || !loc.lng || isNaN(loc.lat) || isNaN(loc.lng)) return

    const customIcon = createCustomMarkerIcon(loc.status, loc.name, loc.color)
    const m = L.marker([loc.lat, loc.lng], { icon: customIcon })

    const imgTag = loc.image
      ? `<img src="${loc.image}" style="width: 100%; height: 90px; object-fit: cover; border-radius: 6px; margin-bottom: 6px;" />`
      : ''

    m.bindPopup(`
      <div style="font-family: sans-serif; max-width: 210px; padding: 2px;">
        ${imgTag}
        <strong style="font-size: 13px; color: #0f172a; display: block; margin-bottom: 4px;">${loc.name}</strong>
        <div style="font-size: 11px; color: #475569; margin-bottom: 2px;">
          Status: <b style="color: ${loc.color};">${loc.status}</b>
        </div>
        <div style="font-size: 11px; color: #64748b;">
          Total Laporan: <b>${loc.laporanCount ?? 0}</b>
        </div>
      </div>
    `)

    m.addTo(mapMarkersLayerGroup.value)
    bounds.push([loc.lat, loc.lng])
  })

  if (bounds.length > 0 && mapSpots.value.length > 0) {
    try {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 })
    } catch {
      // ignore
    }
  }
}

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

onMounted(async () => {
  await fetchDestinationsForDashboard()
  await fetchLatestReports()
  await fetchTotalReportsCount()
  await fetchSpots()

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

  renderMapSpots()
})

onUnmounted(() => {
  if (map) {
    map.remove()
  }
})
</script>

<style scoped lang="scss">
.page-container {
  padding: 2.5rem 1.5rem;

  @media (max-width: 768px) {
    padding: 1.5rem 1rem;
  }

  @media (max-width: 480px) {
    padding: 1rem 0.75rem;
  }
}

.max-width-container {
  max-width: 1400px;
  margin: 0 auto;
}

.font-header {
  font-size: 1.85rem;
  line-height: 1.2;

  @media (max-width: 600px) {
    font-size: 1.4rem;
  }
}

.font-subtitle {
  font-size: 0.95rem;

  @media (max-width: 600px) {
    font-size: 0.85rem;
  }
}

.kpi-card {
  background: linear-gradient(135deg, #7d9240 0%, #5f702e 100%);
  border-radius: 16px;
  min-width: 210px;
  box-shadow: 0 6px 20px rgba(125, 146, 64, 0.25);

  @media (max-width: 599px) {
    width: 100%;
    margin-top: 1rem;
  }
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

  @media (max-width: 768px) {
    height: 280px;
  }
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
