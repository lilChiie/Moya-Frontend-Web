<template>
  <q-page class="page-container bg-grey-2">
    <div class="max-width-container">
      <!-- Header Section -->
      <div class="row items-center justify-between q-mb-md">
        <div class="col-12 col-md-auto q-mb-sm-res">
          <h1 class="text-weight-bold text-grey-9 q-ma-none font-header">
            Clean Reports
          </h1>
          <p class="text-grey-7 q-mt-xs q-mb-none font-subtitle">
            Daftar laporan kotor yang telah menerima bukti kebersihan dari pengguna
          </p>
        </div>

        <div class="col-12 col-md-auto row items-center q-gutter-sm">
          <q-btn
            flat
            dense
            round
            icon="refresh"
            color="grey-8"
            :loading="isLoading"
            @click="refreshData"
          >
            <q-tooltip>Refresh Data</q-tooltip>
          </q-btn>
        </div>
      </div>

      <!-- Quick Summary Cards -->
      <div class="row q-col-gutter-md q-mb-lg">
        <div class="col-12 col-sm-6 col-md-4">
          <q-card flat bordered class="stat-card bg-white q-pa-md rounded-borders-lg">
            <div class="row items-center justify-between">
              <div>
                <div class="text-caption text-grey-7 text-weight-medium">Laporan Berbukti Bersih</div>
                <div class="text-h5 text-weight-bold text-grey-9 q-mt-xs">{{ totalDirtyWithClean }}</div>
              </div>
              <q-avatar icon="fact_check" color="blue-1" text-color="primary" size="48px" />
            </div>
          </q-card>
        </div>

        <div class="col-12 col-sm-6 col-md-4">
          <q-card flat bordered class="stat-card bg-white q-pa-md rounded-borders-lg">
            <div class="row items-center justify-between">
              <div>
                <div class="text-caption text-grey-7 text-weight-medium">Total Foto Bukti Bersih</div>
                <div class="text-h5 text-weight-bold text-positive q-mt-xs">{{ cleanStore.cleanReports.length }}</div>
              </div>
              <q-avatar icon="verified" color="green-1" text-color="positive" size="48px" />
            </div>
          </q-card>
        </div>

        <div class="col-12 col-sm-6 col-md-4">
          <q-card flat bordered class="stat-card bg-white q-pa-md rounded-borders-lg">
            <div class="row items-center justify-between">
              <div>
                <div class="text-caption text-grey-7 text-weight-medium">Menunggu Penyelesaian (Pending)</div>
                <div class="text-h5 text-weight-bold text-warning q-mt-xs">{{ pendingDirtyCount }}</div>
              </div>
              <q-avatar icon="pending_actions" color="amber-1" text-color="warning" size="48px" />
            </div>
          </q-card>
        </div>
      </div>

      <!-- Filters Row -->
      <div class="row items-center justify-between q-col-gutter-sm q-mb-md">
        <div class="col-12 col-sm-7 col-md-5">
          <q-input
            v-model="searchQuery"
            placeholder="Cari destinasi, pelapor, atau catatan..."
            dense
            outlined
            bg-color="white"
            class="search-input"
          >
            <template #prepend>
              <q-icon name="search" color="grey-6" />
            </template>
            <template #append v-if="searchQuery">
              <q-icon name="clear" class="cursor-pointer" @click="searchQuery = ''" />
            </template>
          </q-input>
        </div>

        <div class="col-12 col-sm-auto row items-center q-gutter-sm justify-end">
          <q-select
            v-model="statusFilter"
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

      <!-- Main Clean Reports Table -->
      <q-card flat class="table-card bg-white rounded-borders-lg q-pa-xs-res">
        <q-table
          :rows="filteredTableRows"
          :columns="columns"
          row-key="key"
          flat
          :loading="isLoading"
          class="custom-clean-table"
          :grid="$q.screen.xs"
          :pagination="{ rowsPerPage: 10 }"
          no-data-label="Tidak ada laporan bukti bersih yang cocok"
        >
          <!-- Lokasi & ID Laporan -->
          <template #body-cell-location="props">
            <q-td :props="props">
              <div class="row items-center no-wrap q-gutter-x-xs">
                <span class="text-weight-bold text-grey-9 ellipsis">{{ props.row.location }}</span>
              </div>
              <div class="row items-center q-gutter-x-xs q-mt-xs text-caption">
                <span v-if="props.row.id && props.row.id !== '-'" class="text-weight-bold text-primary">
                  #Laporan {{ props.row.id }}
                </span>
                <span v-if="props.row.id && props.row.id !== '-'" class="text-grey-5">•</span>
                <span class="text-grey-6">{{ props.row.cleanReports.length }} bukti terlampir</span>
              </div>
            </q-td>
          </template>

          <!-- Foto Laporan Kotor -->
          <template #body-cell-dirtyPhoto="props">
            <q-td :props="props">
              <div
                class="table-img-wrapper cursor-pointer"
                @click="openImageZoom(props.row.image, 'Laporan Kotor - ' + props.row.location)"
              >
                <ProxyImage :src="props.row.image" :alt="props.row.location" class="table-img" />
                <div class="table-img-overlay">
                  <q-icon name="zoom_in" color="white" size="18px" />
                </div>
              </div>
            </q-td>
          </template>

          <!-- AI Analysis -->
          <template #body-cell-dirtyAnalysis="props">
            <q-td :props="props">
              <div class="column">
                <q-chip
                  dense
                  size="sm"
                  :class="props.row.aiScore >= 0.5 ? 'bg-red-1 text-negative' : 'bg-green-1 text-positive'"
                  class="text-weight-bold font-chip q-mb-xs style-fit-content"
                >
                  AI Score: {{ props.row.aiScore }}
                </q-chip>
                <span class="text-caption text-grey-8 text-weight-medium line-clamp-2">
                  {{ props.row.aiAnalysis }}
                </span>
              </div>
            </q-td>
          </template>

          <!-- Timestamp -->
          <template #body-cell-timestamp="props">
            <q-td :props="props">
              <span class="text-weight-medium text-grey-9">
                {{ formatDateTime(props.row.timestamp) }}
              </span>
            </q-td>
          </template>

          <!-- Bukti Bersih Masuk -->
          <template #body-cell-buktiBersih="props">
            <q-td :props="props">
              <div class="column items-center">
                <q-chip
                  dense
                  clickable
                  color="positive"
                  text-color="white"
                  icon="verified"
                  class="cursor-pointer text-weight-bold shadow-1 hover-lift q-mb-xs"
                  @click="openCleanProofsModal(props.row)"
                >
                  {{ props.row.cleanReports.length }} Bukti Bersih
                </q-chip>
                <span class="text-caption text-grey-6" style="font-size: 11px">
                  Oleh: {{ props.row.latestReporter }}
                </span>
              </div>
            </q-td>
          </template>

          <!-- Status Penanganan Laporan Kotor -->
          <template #body-cell-status="props">
            <q-td :props="props">
              <div
                :class="[
                  'status-pill',
                  props.row.status === 'Resolved' ? 'status-handled' : 'status-pending',
                ]"
              >
                <q-icon
                  :name="props.row.status === 'Resolved' ? 'check_circle' : 'pending'"
                  size="15px"
                  class="q-mr-xs"
                />
                <span>{{ props.row.status }}</span>
              </div>
            </q-td>
          </template>

          <!-- Aksi -->
          <template #body-cell-aksi="props">
            <q-td :props="props">
              <div class="row items-center justify-center q-gutter-x-xs no-wrap">
                <q-btn
                  unelevated
                  dense
                  no-caps
                  color="primary"
                  icon="photo_library"
                  label="Lihat Bukti"
                  class="rounded-btn q-px-sm text-weight-bold"
                  @click="openCleanProofsModal(props.row)"
                >
                  <q-tooltip>Lihat foto bukti bersih dari pengguna</q-tooltip>
                </q-btn>

                <q-btn
                  flat
                  round
                  dense
                  color="grey-8"
                  icon="open_in_new"
                  @click="goToMonitoring(props.row)"
                >
                  <q-tooltip>Buka di Monitoring Destinasi</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </template>

          <!-- Mobile Card View (Grid) -->
          <template #item="props">
            <div class="q-pa-xs col-xs-12 col-sm-6">
              <q-card flat bordered class="q-pa-md rounded-borders-lg bg-white shadow-1">
                <div class="row items-center justify-between q-mb-sm">
                  <div
                    :class="[
                      'status-pill',
                      props.row.status === 'Resolved' ? 'status-handled' : 'status-pending',
                    ]"
                  >
                    <q-icon
                      :name="props.row.status === 'Resolved' ? 'check_circle' : 'pending'"
                      size="14px"
                      class="q-mr-xs"
                    />
                    <span>{{ props.row.status }}</span>
                  </div>

                  <q-chip
                    dense
                    color="positive"
                    text-color="white"
                    icon="verified"
                    class="text-weight-bold"
                  >
                    {{ props.row.cleanReports.length }} Bukti
                  </q-chip>
                </div>

                <div class="row items-center q-gutter-x-sm q-mb-sm">
                  <div
                    class="table-img-wrapper cursor-pointer"
                    @click="openImageZoom(props.row.image, 'Laporan Kotor - ' + props.row.location)"
                  >
                    <ProxyImage :src="props.row.image" :alt="props.row.location" class="table-img" />
                  </div>
                  <div class="column">
                    <span class="text-subtitle2 text-weight-bold text-grey-9">{{ props.row.location }}</span>
                    <span class="text-caption text-grey-6" style="font-size: 11px">
                      {{ formatDateTime(props.row.timestamp) }}
                    </span>
                  </div>
                </div>

                <div class="q-mt-xs q-mb-sm">
                  <q-chip
                    dense
                    size="sm"
                    :class="props.row.aiScore >= 0.5 ? 'bg-red-1 text-negative' : 'bg-green-1 text-positive'"
                    class="text-weight-bold font-chip q-mb-xs"
                  >
                    AI Score: {{ props.row.aiScore }}
                  </q-chip>
                  <div class="text-caption text-grey-8 text-weight-medium">
                    {{ props.row.aiAnalysis }}
                  </div>
                </div>

                <div class="row items-center justify-between q-mt-md q-pt-sm border-top">
                  <q-btn
                    unelevated
                    dense
                    no-caps
                    color="primary"
                    icon="photo_library"
                    label="Lihat Bukti"
                    class="rounded-btn q-px-sm"
                    @click="openCleanProofsModal(props.row)"
                  />
                  <q-btn
                    flat
                    dense
                    no-caps
                    color="secondary"
                    icon="assessment"
                    label="Monitoring"
                    @click="goToMonitoring(props.row)"
                  />
                </div>
              </q-card>
            </div>
          </template>
        </q-table>
      </q-card>
    </div>

    <!-- Dialog Modal Detail Bukti Pembersihan Pengguna -->
    <q-dialog v-model="showCleanProofsModal">
      <q-card style="width: 760px; max-width: 95vw" class="rounded-borders-lg bg-white overflow-hidden">
        <q-card-section class="row items-center justify-between bg-primary text-white q-py-sm">
          <div class="row items-center q-gutter-x-sm">
            <q-icon name="verified" size="22px" />
            <div class="text-subtitle1 text-weight-bold">
              Bukti Bersih: {{ selectedRowForProofs?.location || 'Laporan Destinasi' }}
            </div>
          </div>
          <q-btn flat round dense icon="close" v-close-popup color="white" />
        </q-card-section>

        <q-card-section class="q-pa-md" v-if="selectedRowForProofs">
          <!-- Banner Perbandingan Singkat: Laporan Kotor Asal -->
          <q-card flat bordered class="q-pa-sm bg-grey-1 rounded-borders q-mb-md">
            <div class="row items-center justify-between q-col-gutter-sm">
              <div class="col-12 col-sm-auto row items-center q-gutter-x-sm">
                <div
                  class="proof-thumb-small cursor-pointer"
                  @click="openImageZoom(selectedRowForProofs.image, 'Laporan Kotor Asal')"
                >
                  <ProxyImage :src="selectedRowForProofs.image" :alt="selectedRowForProofs.location" class="full-cover" />
                  <div class="thumb-zoom-overlay">
                    <q-icon name="zoom_in" color="white" size="14px" />
                  </div>
                </div>
                <div>
                  <div class="text-caption text-weight-bold text-grey-9">
                    Kondisi Kotor Awal (#Laporan {{ selectedRowForProofs.id }})
                  </div>
                  <div class="text-caption text-grey-6" style="font-size: 11px">
                    {{ formatDateTime(selectedRowForProofs.timestamp) }} • AI Score: {{ selectedRowForProofs.aiScore }}
                  </div>
                </div>
              </div>

              <div class="col-12 col-sm-auto row items-center q-gutter-x-xs">
                <span class="text-caption text-grey-7 q-mr-xs">Status Penanganan:</span>
                <div
                  :class="[
                    'status-pill',
                    selectedRowForProofs.status === 'Resolved' ? 'status-handled' : 'status-pending',
                  ]"
                >
                  <q-icon
                    :name="selectedRowForProofs.status === 'Resolved' ? 'check_circle' : 'pending'"
                    size="14px"
                    class="q-mr-xs"
                  />
                  <span>{{ selectedRowForProofs.status }}</span>
                </div>
              </div>
            </div>
          </q-card>

          <!-- List Kartu Foto Bukti Bersih Pengguna -->
          <div class="text-subtitle2 text-weight-bold text-grey-9 q-mb-sm row items-center">
            <span>Foto Bukti Bersih dari Pengguna ({{ selectedRowForProofs.cleanReports?.length || 0 }} Foto):</span>
          </div>

          <div
            v-if="!selectedRowForProofs.cleanReports || selectedRowForProofs.cleanReports.length === 0"
            class="text-caption text-grey-6 q-pa-md text-center bg-grey-1 rounded-borders"
          >
            Belum ada foto bukti bersih yang dikirim pengguna untuk laporan ini.
          </div>

          <div v-else class="row q-col-gutter-sm max-modal-scroll">
            <div
              v-for="(proof, idx) in selectedRowForProofs.cleanReports"
              :key="proof.id || idx"
              class="col-12 col-sm-6"
            >
              <q-card flat bordered class="q-pa-sm rounded-borders bg-white h-100 flex-column justify-between shadow-xs">
                <div>
                  <div
                    class="proof-img-container cursor-pointer q-mb-xs"
                    @click="openImageZoom(proof.image_url, 'Bukti Bersih - ' + (proof.reporter_name || 'Pengguna'))"
                  >
                    <ProxyImage :src="proof.image_url" :alt="proof.reporter_name" class="proof-img" />
                    <div class="proof-img-overlay">
                      <q-icon name="zoom_in" color="white" size="20px" />
                      <span class="text-white text-caption q-ml-xs">Klik untuk perbesar</span>
                    </div>
                  </div>

                  <div class="row items-center justify-between q-mt-xs">
                    <span class="text-subtitle2 text-weight-bold text-grey-9 ellipsis">
                      {{ proof.reporter_name || 'Pengguna' }}
                    </span>
                    <span class="text-caption text-grey-5" style="font-size: 11px">
                      {{ formatDateTime(proof.created_at) }}
                    </span>
                  </div>

                  <div class="text-caption text-grey-6 ellipsis" style="font-size: 11px">
                    {{ proof.reporter_role || 'Warga / Wisatawan' }}
                  </div>

                  <div
                    v-if="proof.user_notes"
                    class="text-caption text-grey-8 bg-grey-1 q-pa-xs rounded-borders q-mt-xs"
                    style="font-style: italic"
                  >
                    "{{ proof.user_notes }}"
                  </div>
                </div>
              </q-card>
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="between" class="q-pa-md bg-grey-1">
          <div>
            <q-btn
              flat
              no-caps
              color="primary"
              icon="open_in_new"
              label="Buka di Monitoring"
              @click="goToMonitoring(selectedRowForProofs)"
            />
          </div>

          <div class="row items-center q-gutter-x-sm">
            <q-btn flat label="Tutup" no-caps color="grey-8" v-close-popup />
            <q-btn
              v-if="selectedRowForProofs && selectedRowForProofs.status !== 'Resolved'"
              color="positive"
              icon="check_circle"
              no-caps
              unelevated
              style="border-radius: 10px"
              label="Ubah Status ke Resolved"
              :loading="isSubmittingStatus"
              @click="markReportResolved(selectedRowForProofs)"
            >
              <q-tooltip>Tandai laporan kotor ini telah selesai ditangani</q-tooltip>
            </q-btn>
          </div>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog Modal Zoom Gambar -->
    <q-dialog v-model="showImageZoomModal">
      <q-card style="width: 700px; max-width: 95vw" class="rounded-borders-lg overflow-hidden bg-white">
        <q-card-section class="row items-center justify-between bg-grey-9 text-white q-py-sm">
          <div class="text-subtitle2 text-weight-bold ellipsis">{{ zoomedImageTitle || 'Preview Foto' }}</div>
          <q-btn flat round dense icon="close" v-close-popup color="white" />
        </q-card-section>
        <q-card-section class="q-pa-none bg-black flex flex-center" style="min-height: 350px; max-height: 80vh">
          <ProxyImage :src="zoomedImageUrl" :alt="zoomedImageTitle" style="max-width: 100%; max-height: 75vh; object-fit: contain" />
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useCleanReportsStore } from 'src/stores/cleanReports'
import { api } from 'boot/axios'
import ProxyImage from 'components/ProxyImage.vue'

const $q = useQuasar()
const router = useRouter()
const cleanStore = useCleanReportsStore()

const isLoading = ref(false)
const searchQuery = ref('')
const statusFilter = ref('all')
const dirtyReports = ref([])
const destinationList = ref([])

const statusOptions = [
  { label: 'Semua Status Laporan Kotor', value: 'all' },
  { label: 'Laporan Kotor Pending', value: 'pending' },
  { label: 'Laporan Kotor Resolved', value: 'resolved' },
]

const columns = [
  {
    name: 'location',
    label: 'Destinasi & ID Laporan',
    field: 'location',
    align: 'left',
    sortable: true,
  },
  {
    name: 'dirtyPhoto',
    label: 'Foto Laporan Kotor',
    field: 'image',
    align: 'center',
  },
  {
    name: 'dirtyAnalysis',
    label: 'Analisis AI',
    field: 'aiSummary',
    align: 'left',
  },
  {
    name: 'timestamp',
    label: 'Waktu Lapor Kotor',
    field: 'timestamp',
    align: 'left',
    sortable: true,
  },
  {
    name: 'buktiBersih',
    label: 'Bukti Bersih Masuk',
    field: 'cleanProofCount',
    align: 'center',
    sortable: true,
  },
  {
    name: 'status',
    label: 'Status Penanganan',
    field: 'status',
    align: 'center',
    sortable: true,
  },
  {
    name: 'aksi',
    label: 'Aksi',
    field: 'key',
    align: 'center',
  },
]

const showCleanProofsModal = ref(false)
const selectedRowForProofs = ref(null)
const isSubmittingStatus = ref(false)

const showImageZoomModal = ref(false)
const zoomedImageUrl = ref('')
const zoomedImageTitle = ref('')

function openImageZoom(imgUrl, title) {
  zoomedImageUrl.value = imgUrl
  zoomedImageTitle.value = title || 'Preview Foto'
  showImageZoomModal.value = true
}

function openCleanProofsModal(row) {
  selectedRowForProofs.value = row
  showCleanProofsModal.value = true
}

function formatReportImage(url) {
  if (!url || typeof url !== 'string') return ''
  if ((url.startsWith('http://') || url.startsWith('https://')) && url.includes('ngrok') && url.includes('/static/')) {
    return url.substring(url.indexOf('/static/'))
  }
  if (url.includes('/static/')) return url.substring(url.indexOf('/static/'))
  if (url.startsWith('data:image/') || url.startsWith('http://') || url.startsWith('https://')) return url
  return url.startsWith('/') ? url : `/${url}`
}

function formatDateTime(dateStr) {
  if (!dateStr || dateStr === '-') return '-'
  const str = String(dateStr).trim()
  if (/^\d{2}\/\d{2}\/\d{4}/.test(str)) return str

  const match = str.match(/^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2})(?::(\d{2}))?/)
  if (match) {
    const [, year, month, day, hours, minutes, seconds = '00'] = match
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`
  }

  const dateOnlyMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (dateOnlyMatch) {
    const [, year, month, day] = dateOnlyMatch
    return `${day}/${month}/${year}`
  }

  return str.replace('T', ' ')
}

function resolveLocationName(item) {
  let name = item.destination_name || item.destination?.name || item.location || item.name || ''
  if (!name && item.destination_id) {
    const found = destinationList.value.find((d) => (d.id || d.destination_id) == item.destination_id)
    if (found) name = found.name || ''
  }
  if (!name && item.destination_id) name = `Destination #${item.destination_id}`
  return name || 'Destinasi Wisata'
}

function mapDirtyReport(item) {
  const score = item.score ?? item.ai_score ?? item.aiScore ?? 0
  const count = item.detected_count ?? item.detectedCount
  let analysis = item.ai_analysis || item.aiAnalysis || ''
  if (!analysis) {
    analysis = (count !== undefined && count !== null)
      ? (count > 0 ? `${count} objek sampah terdeteksi` : 'Area Bersih')
      : (Number(score) >= 0.5 ? 'Area kotor terdeteksi' : 'Area bersih')
  }

  const s = String(item.status || '').toLowerCase()
  const statusStr = (s === 'resolved' || s === 'handled') ? 'Resolved' : 'Pending'

  return {
    id: item.id,
    destination_id: item.destination_id,
    location: resolveLocationName(item),
    image: formatReportImage(item.image_url || item.image || item.photo),
    aiScore: score,
    aiAnalysis: analysis,
    timestamp: formatDateTime(item.created_at || item.timestamp || item.reported_at || '-'),
    status: statusStr,
    reporterNotes: item.user_notes || item.reporter_notes || item.description || '',
    notes: item.admin_notes || item.notes || '',
    raw: item,
  }
}

async function fetchDestinations() {
  try {
    let res
    try { res = await api.get('/destinations/') } catch { res = await api.get('/destinations') }
    const raw = res.data?.data || res.data || []
    destinationList.value = Array.isArray(raw) ? raw : []
  } catch (e) {
    console.warn('Failed to fetch destinations:', e)
  }
}

async function fetchDirtyReports() {
  try {
    let res
    try { res = await api.get('/reports') } catch { res = await api.get('/reports/') }
    const raw = res.data?.data || res.data || []
    dirtyReports.value = (Array.isArray(raw) ? raw : []).map(mapDirtyReport)
  } catch (e) {
    console.warn('Failed to fetch dirty reports:', e)
  }
}

async function refreshData() {
  isLoading.value = true
  try {
    await fetchDestinations()
    await Promise.all([
      cleanStore.fetchCleanReports(),
      fetchDirtyReports(),
    ])
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  cleanStore.loadFromStorage()
  await refreshData()
})

/**
 * Grouping Laporan Bersih per Laporan Kotor
 */
const tableRows = computed(() => {
  const rows = []
  const assignedCleanIds = new Set()

  // 1. Loop setiap laporan kotor dan pasangkan laporan bersih yang sesuai
  dirtyReports.value.forEach((dr) => {
    const matchedCleans = cleanStore.getCleanReportsForDirtyReport(dr)

    if (matchedCleans.length > 0) {
      matchedCleans.forEach((c) => assignedCleanIds.add(c.id))
      rows.push({
        key: `dirty_${dr.id}`,
        id: dr.id,
        destination_id: dr.destination_id,
        location: dr.location,
        image: dr.image,
        aiScore: dr.aiScore,
        aiAnalysis: dr.aiAnalysis,
        timestamp: dr.timestamp,
        status: dr.status,
        cleanReports: matchedCleans,
        cleanProofCount: matchedCleans.length,
        latestReporter: matchedCleans[0]?.reporter_name || 'Pengguna',
        dirtyReport: dr,
      })
    }
  })

  // 2. Jika ada clean report yang belum tertaut ke laporan kotor mana pun, buatkan baris tersendiri
  const unlinkedCleans = cleanStore.cleanReports.filter((cr) => !assignedCleanIds.has(cr.id))
  if (unlinkedCleans.length > 0) {
    const unlinkedByDest = new Map()
    unlinkedCleans.forEach((cr) => {
      const destKey = cr.destination_name || 'Destinasi Lainnya'
      if (!unlinkedByDest.has(destKey)) {
        unlinkedByDest.set(destKey, [])
      }
      unlinkedByDest.get(destKey).push(cr)
    })

    unlinkedByDest.forEach((cleans, destName) => {
      rows.push({
        key: `unlinked_${destName}`,
        id: '-',
        destination_id: cleans[0]?.destination_id || null,
        location: destName,
        image: cleans[0]?.image_url || '',
        aiScore: 0,
        aiAnalysis: 'Laporan bersih mandiri pengguna',
        timestamp: cleans[0]?.created_at || '-',
        status: 'Pending',
        cleanReports: cleans,
        cleanProofCount: cleans.length,
        latestReporter: cleans[0]?.reporter_name || 'Pengguna',
        dirtyReport: null,
      })
    })
  }

  return rows
})

const filteredTableRows = computed(() => {
  return tableRows.value.filter((row) => {
    // Filter status laporan kotor
    if (statusFilter.value === 'pending' && row.status !== 'Pending') {
      return false
    }
    if (statusFilter.value === 'resolved' && row.status !== 'Resolved') {
      return false
    }

    // Filter search query
    const q = searchQuery.value.trim().toLowerCase()
    if (!q) return true

    const loc = (row.location || '').toLowerCase()
    const matchLoc = loc.includes(q)
    const matchCleans = row.cleanReports.some((cr) => {
      return (
        (cr.reporter_name || '').toLowerCase().includes(q) ||
        (cr.user_notes || '').toLowerCase().includes(q)
      )
    })

    return matchLoc || matchCleans
  })
})

const totalDirtyWithClean = computed(() => tableRows.value.length)
const pendingDirtyCount = computed(() => {
  return tableRows.value.filter((r) => r.status === 'Pending').length
})

/**
 * Route ke Monitoring Detail Page
 */
function goToMonitoring(row) {
  const destKey = row.destination_id ? String(row.destination_id) : (row.location || 'monitoring')

  const allDestDirty = dirtyReports.value.filter((item) => {
    if (row.destination_id && item.destination_id) {
      return String(item.destination_id) === String(row.destination_id)
    }
    return item.location === row.location
  })

  sessionStorage.setItem(
    `monitoring_dest_${destKey}`,
    JSON.stringify({
      location: row.location || 'Destinasi',
      destinationId: row.destination_id,
      targetReportId: row.id,
      reports: allDestDirty.length > 0 ? allDestDirty : (row.dirtyReport ? [row.dirtyReport] : []),
    })
  )

  router.push(`/admin/monitoring/${destKey}`)
}

/**
 * Tandai Laporan Kotor Selesai (Resolved)
 */
async function markReportResolved(row) {
  if (!row || !row.id || row.id === '-') {
    $q.notify({
      type: 'warning',
      message: 'Laporan ini tidak tertaut ke ID laporan kotor spesifik.',
      position: 'top',
    })
    return
  }

  isSubmittingStatus.value = true
  const reportId = row.id
  const payload = {
    status: 'resolved',
    admin_notes: 'Status diselesaikan via verifikasi bukti bersih',
    notes: 'Status diselesaikan via verifikasi bukti bersih',
  }

  const reqConfig = { headers: { 'ngrok-skip-browser-warning': 'true' } }

  try {
    try {
      await api.put(`/reports/${reportId}`, payload, reqConfig)
    } catch {
      await api.put(`/reports/${reportId}/`, payload, reqConfig)
    }

    // Update state secara lokal
    row.status = 'Resolved'
    if (row.dirtyReport) row.dirtyReport.status = 'Resolved'
    const foundDirty = dirtyReports.value.find((d) => d.id === reportId)
    if (foundDirty) foundDirty.status = 'Resolved'

    $q.notify({
      type: 'positive',
      message: `Laporan #${reportId} (${row.location}) berhasil ditandai Resolved!`,
      position: 'top',
    })
  } catch (err) {
    console.error('Gagal update status laporan:', err)
    $q.notify({
      type: 'negative',
      message: 'Gagal memperbarui status laporan ke backend.',
      position: 'top',
    })
  } finally {
    isSubmittingStatus.value = false
  }
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
  min-width: 260px;
}

.filter-select {
  min-width: 220px;
}

.table-card {
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
}

.custom-clean-table {
  :deep(thead tr th) {
    font-size: 0.82rem;
    font-weight: 700;
    color: #475569;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    background-color: #f8fafc;
    border-bottom: 2px solid #e2e8f0;
    padding: 14px 16px;
  }

  :deep(tbody tr td) {
    font-size: 0.9rem;
    padding: 12px 16px;
    border-bottom: 1px solid #f1f5f9;
  }

  :deep(tbody tr:hover) {
    background-color: #f8fafc;
  }
}

.table-img-wrapper {
  position: relative;
  width: 68px;
  height: 52px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  display: inline-block;

  .table-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .table-img-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.35);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.2s;
  }

  &:hover .table-img-overlay {
    opacity: 1;
  }
}

.status-pill {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 700;

  &.status-handled {
    background-color: #ecfdf5;
    color: #059669;
    border: 1px solid #a7f3d0;
  }

  &.status-pending {
    background-color: #fffbeb;
    color: #d97706;
    border: 1px solid #fde68a;
  }
}

.font-chip {
  font-size: 11px;
}

.style-fit-content {
  width: fit-content;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.hover-lift {
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 10px rgba(16, 185, 129, 0.25);
  }
}

.proof-thumb-small {
  position: relative;
  width: 52px;
  height: 42px;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid #cbd5e1;

  .full-cover {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .thumb-zoom-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.35);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.2s;
  }

  &:hover .thumb-zoom-overlay {
    opacity: 1;
  }
}

.proof-img-container {
  position: relative;
  width: 100%;
  height: 160px;
  border-radius: 8px;
  overflow: hidden;
  background-color: #0f172a;

  .proof-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .proof-img-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.2s;
  }

  &:hover .proof-img-overlay {
    opacity: 1;
  }
}

.max-modal-scroll {
  max-height: 55vh;
  overflow-y: auto;
}

.shadow-xs {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.rounded-btn {
  border-radius: 8px;
}

.rounded-borders-lg {
  border-radius: 14px;
}

.border-top {
  border-top: 1px solid #f1f5f9;
}
</style>
