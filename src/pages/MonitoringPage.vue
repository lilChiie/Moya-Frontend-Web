<template>
  <q-page class="page-container bg-grey-2">
    <div class="max-width-container">
      <div class="row items-center justify-between q-mb-sm">
        <div class="col-12 col-md-auto q-mb-sm-res">
          <h1 class="text-weight-bold text-grey-9 q-ma-none font-header">
            Cleanliness Report Monitoring
          </h1>
          <p class="text-grey-7 q-mt-xs q-mb-none font-subtitle">
            Manage and monitor cleanliness status for Batam tourism destinations
          </p>
        </div>
      </div>

      <div class="row items-center justify-between q-col-gutter-sm q-my-md">
        <div class="col-12 col-sm-7 col-md-5">
          <q-input
            v-model="filterSearch"
            placeholder="Search location..."
            dense
            outlined
            bg-color="white"
            class="search-input"
          >
            <template #prepend>
              <q-icon name="search" color="grey-6" />
            </template>
          </q-input>
        </div>

        <div class="col-12 col-sm-auto row justify-end">
          <q-select
            v-model="filterStatus"
            :options="statusOptions"
            dense
            outlined
            bg-color="white"
            class="filter-select"
            emit-value
            map-options
          >
            <template #prepend>
              <q-icon name="filter_list" color="grey-6" />
            </template>
          </q-select>
        </div>
      </div>

      <q-card flat class="table-card q-pa-xs-res">
        <q-table
          :rows="filteredRows"
          :columns="columns"
          row-key="destinationKey"
          flat
          :loading="isLoading"
          class="custom-monitoring-table"
          :grid="$q.screen.xs"
          :pagination="{ rowsPerPage: 10 }"
        >
          <template #body-cell-location="props">
            <q-td :props="props">
              <div class="text-weight-bold text-grey-9">{{ props.row.location }}</div>
              <div class="text-caption text-grey-6">
                {{ props.row.totalReports }} waste report(s)
              </div>
            </q-td>
          </template>

          <template #body-cell-foto="props">
            <q-td :props="props">
              <div
                class="table-img-wrapper cursor-pointer"
                @click="goToDetail(props.row)"
              >
                <ProxyImage :src="props.row.image" :alt="props.row.location" class="table-img" />
              </div>
            </q-td>
          </template>

          <template #body-cell-analisis="props">
            <q-td :props="props">
              <div class="column">
                <q-chip
                  dense
                  size="sm"
                  :class="props.row.worstScore >= 0.5 ? 'bg-red-1 text-negative' : 'bg-green-1 text-positive'"
                  class="text-weight-bold font-chip q-mb-xs style-fit-content"
                >
                  AI Score: {{ props.row.worstScore }}
                </q-chip>
                <span class="text-caption text-grey-8 text-weight-medium">
                  {{ props.row.aiSummary }}
                </span>
              </div>
            </q-td>
          </template>

          <template #body-cell-timestamp="props">
            <q-td :props="props">
              <span class="text-weight-medium text-grey-9">
                {{ formatDateTime(props.row.latestTimestamp) }}
              </span>
            </q-td>
          </template>

          <template #body-cell-status="props">
            <q-td :props="props">
              <div
                :class="[
                  'status-pill',
                  props.row.overallStatus === 'Resolved' ? 'status-handled' : 'status-pending',
                ]"
              >
                <q-icon
                  :name="props.row.overallStatus === 'Resolved' ? 'check_circle' : 'pending'"
                  size="16px"
                  class="q-mr-xs"
                />
                <span>{{ props.row.overallStatus }}</span>
              </div>
            </q-td>
          </template>

          <template #body-cell-aksi="props">
            <q-td :props="props">
              <div class="row items-center q-gutter-x-xs">
                <q-btn
                  flat
                  round
                  dense
                  color="primary"
                  icon="visibility"
                  @click="goToDetail(props.row)"
                >
                  <q-tooltip>View Reports for this Destination</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </template>

          <template #item="props">
            <div class="q-pa-xs col-xs-12 col-sm-6">
              <q-card flat bordered class="q-pa-md rounded-borders-lg bg-white shadow-1">
                <div class="row items-center justify-between q-mb-sm">
                  <div
                    :class="[
                      'status-pill',
                      props.row.overallStatus === 'Resolved' ? 'status-handled' : 'status-pending',
                    ]"
                  >
                    <q-icon
                      :name="props.row.overallStatus === 'Resolved' ? 'check_circle' : 'pending'"
                      size="14px"
                      class="q-mr-xs"
                    />
                    <span>{{ props.row.overallStatus }}</span>
                  </div>
                  <q-btn
                    flat
                    round
                    dense
                    color="primary"
                    icon="visibility"
                    size="sm"
                    @click="goToDetail(props.row)"
                  />
                </div>

                <div class="row items-center q-gutter-x-sm q-mb-sm">
                  <div class="table-img-wrapper cursor-pointer" @click="goToDetail(props.row)">
                    <ProxyImage :src="props.row.image" :alt="props.row.location" class="table-img" />
                  </div>
                  <div class="column">
                    <span class="text-subtitle2 text-weight-bold text-grey-9">{{ props.row.location }}</span>
                    <span class="text-caption text-grey-6" style="font-size: 11px">
                      {{ props.row.latestTimestamp }}
                    </span>
                  </div>
                </div>

                <div class="q-mt-xs">
                  <q-chip
                    dense
                    size="sm"
                    :class="props.row.worstScore >= 0.5 ? 'bg-red-1 text-negative' : 'bg-green-1 text-positive'"
                    class="text-weight-bold font-chip q-mb-xs"
                  >
                    AI Score: {{ props.row.worstScore }}
                  </q-chip>
                  <div class="text-caption text-grey-8 text-weight-medium">
                    {{ props.row.aiSummary }}
                  </div>
                </div>
              </q-card>
            </div>
          </template>
        </q-table>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from 'boot/axios'
import ProxyImage from 'components/ProxyImage.vue'
import report1Img from 'assets/report1.jpg'

const router = useRouter()

const isLoading = ref(false)
const filterSearch = ref('')
const filterStatus = ref('All')

const statusOptions = [
  { label: 'All Statuses', value: 'All' },
  { label: 'Pending', value: 'Pending' },
  { label: 'Resolved', value: 'Resolved' },
]

const columns = [
  {
    name: 'location',
    label: 'Location',
    field: 'location',
    align: 'left',
    sortable: true,
    style: 'font-weight: 700; color: #1E293B;',
  },
  {
    name: 'foto',
    label: 'Location Photo',
    field: 'image',
    align: 'center',
  },
  {
    name: 'analisis',
    label: 'AI Analysis',
    field: 'aiSummary',
    align: 'left',
  },
  {
    name: 'timestamp',
    label: 'Report Time',
    field: 'latestTimestamp',
    align: 'left',
    sortable: true,
  },
  {
    name: 'status',
    label: 'Handling Status',
    field: 'overallStatus',
    align: 'center',
    sortable: true,
  },
  {
    name: 'aksi',
    label: 'Actions',
    field: 'destinationKey',
    align: 'center',
  },
]

const allReports = ref([])
const destinationList = ref([])

async function fetchDestinations() {
  try {
    let res
    try { res = await api.get('/destinations/') } catch { res = await api.get('/destinations') }
    const raw = res.data?.data || res.data || []
    destinationList.value = Array.isArray(raw) ? raw : []
  } catch (e) {
    console.error('Failed to fetch destinations:', e)
  }
}

function formatReportImage(url) {
  if (!url || typeof url !== 'string') return report1Img
  if ((url.startsWith('http://') || url.startsWith('https://')) && url.includes('ngrok') && url.includes('/static/')) {
    return url.substring(url.indexOf('/static/'))
  }
  if (url.includes('/static/')) return url.substring(url.indexOf('/static/'))
  if (url.startsWith('data:image/') || url.startsWith('http://') || url.startsWith('https://')) return url
  return url.startsWith('/') ? url : `/${url}`
}

function formatStatus(st) {
  if (!st) return 'Pending'
  const s = String(st).toLowerCase()
  return (s === 'resolved' || s === 'handled') ? 'Resolved' : 'Pending'
}

function resolveLocationName(item) {
  let name = item.destination_name || item.destination?.name || item.location || item.name || ''
  if (!name && item.destination_id) {
    const found = destinationList.value.find((d) => (d.id || d.destination_id) == item.destination_id)
    if (found) name = found.name || ''
  }
  if (!name && item.destination_id) name = `Destination #${item.destination_id}`
  return name || '-'
}

function formatDateTime(dateStr) {
  if (!dateStr || dateStr === '-') return '-'
  const str = String(dateStr).trim()
  if (/^\d{2}\/\d{2}\/\d{4}/.test(str)) return str
  try {
    let d
    if (str.includes('T') && !str.endsWith('Z') && !/[+-]\d{2}:\d{2}$/.test(str)) {
      d = new Date(str + 'Z')
    } else {
      d = new Date(str)
    }
    if (isNaN(d.getTime())) {
      return str.replace('T', ' ')
    }
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    const seconds = String(d.getSeconds()).padStart(2, '0')
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`
  } catch {
    return str.replace('T', ' ')
  }
}

function mapReport(item) {
  const score = item.score ?? item.ai_score ?? item.aiScore ?? 0
  const count = item.detected_count ?? item.detectedCount
  let analysis = item.ai_analysis || item.aiAnalysis || ''
  if (!analysis) {
    analysis = (count !== undefined && count !== null)
      ? (count > 0 ? `${count} waste objects detected` : 'No waste detected (Clean)')
      : (Number(score) >= 0.5 ? 'Dirty area detected' : 'Clean area')
  }
  return {
    id: item.id,
    destination_id: item.destination_id,
    location: resolveLocationName(item),
    image: formatReportImage(item.image_url || item.image || item.photo),
    aiScore: score,
    aiAnalysis: analysis,
    timestamp: formatDateTime(item.created_at || item.timestamp || item.reported_at || '-'),
    status: formatStatus(item.status),
    reporterNotes: item.user_notes || item.reporter_notes || item.description || '',
    notes: item.admin_notes || item.notes || '',
    raw: item,
  }
}

async function fetchReports() {
  isLoading.value = true
  try {
    let res
    try {
      res = await api.get('/reports')
    } catch {
      res = await api.get('/reports/')
    }
    const raw = res.data?.data || res.data || []
    allReports.value = (Array.isArray(raw) ? raw : []).map(mapReport)
  } catch (err) {
    console.error('Failed to fetch reports:', err)
    allReports.value = []
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  await fetchDestinations()
  await fetchReports()
})

const destinationRows = computed(() => {
  const map = new Map()

  allReports.value.forEach((rep) => {
    const key = rep.destination_id ? String(rep.destination_id) : rep.location
    if (!map.has(key)) {
      map.set(key, {
        destinationKey: key,
        destinationId: rep.destination_id,
        location: rep.location,
        image: rep.image,
        reports: [],
        pendingCount: 0,
        resolvedCount: 0,
        worstScore: 0,
        latestTimestamp: rep.timestamp,
      })
    }
    const g = map.get(key)
    g.reports.push(rep)
    if (rep.status === 'Resolved') g.resolvedCount++
    else g.pendingCount++
    if (Number(rep.aiScore) > Number(g.worstScore)) {
      g.worstScore = rep.aiScore
      g.image = rep.image
      g.latestTimestamp = rep.timestamp
    }
  })

  return Array.from(map.values()).map((g) => ({
    ...g,
    overallStatus: g.pendingCount > 0 ? 'Pending' : 'Resolved',
    totalReports: g.reports.length,
    aiSummary: g.pendingCount > 0
      ? `${g.pendingCount} waste report(s) unresolved`
      : `All ${g.resolvedCount} report(s) resolved`,
  }))
})

const filteredRows = computed(() => {
  return destinationRows.value.filter((row) => {
    const q = filterSearch.value.trim().toLowerCase()
    const matchSearch = !q || row.location.toLowerCase().includes(q)
    const matchStatus = filterStatus.value === 'All' || row.overallStatus === filterStatus.value
    return matchSearch && matchStatus
  })
})

function goToDetail(row) {
  sessionStorage.setItem(
    `monitoring_dest_${row.destinationKey}`,
    JSON.stringify({ location: row.location, destinationId: row.destinationId, reports: row.reports })
  )
  router.push(`/admin/monitoring/${row.destinationKey}`)
}
</script>

<style scoped lang="scss">
.page-container {
  padding: 2.5rem 1.5rem;
  @media (max-width: 768px) { padding: 1.5rem 1rem; }
  @media (max-width: 480px) { padding: 1rem 0.75rem; }
}

.max-width-container {
  max-width: 1400px;
  margin: 0 auto;
}

.font-header {
  font-size: 1.85rem;
  line-height: 1.2;
  @media (max-width: 600px) { font-size: 1.4rem; }
}

.font-subtitle {
  font-size: 0.95rem;
  @media (max-width: 600px) { font-size: 0.85rem; }
}

:deep(.q-field__control) {
  border-radius: 12px !important;
}

.search-input {
  width: 100%;
  max-width: 380px;
}

.filter-select {
  width: 100%;
  min-width: 170px;
  @media (max-width: 599px) { margin-top: 0.5rem; }
}

.table-card {
  border-radius: 16px;
  background-color: #ffffff;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  border: 1px solid #e2e8f0;
  overflow-x: auto;
}

.table-img-wrapper {
  width: 90px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  display: inline-block;
  transition: transform 0.2s ease;
  &:hover { transform: scale(1.05); }
  .table-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.status-pill {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 9999px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.3px;
}

.status-pending { background-color: #fef3c7; color: #b45309; }
.status-handled { background-color: #dcfce7; color: #15803d; }
</style>
