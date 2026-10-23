<template>
  <q-page class="page-container bg-grey-2">
    <div class="max-width-container">
      <!-- Header Section -->
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

      <!-- Filter Row -->
      <div class="row items-center justify-between q-col-gutter-sm q-my-md">
        <div class="col-12 col-sm-7 col-md-5">
          <q-input
            v-model="filterSearch"
            placeholder="Search location or notes..."
            dense
            outlined
            bg-color="white"
            class="search-input"
          >
            <template #prepend>
              <q-icon name="search" color="grey-6" />
            </template>
            <template #append v-if="filterSearch">
              <q-icon name="clear" class="cursor-pointer" @click="filterSearch = ''" />
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

      <!-- Main Table -->
      <q-card flat class="table-card q-pa-xs-res">
        <q-table
          :rows="filteredRows"
          :columns="columns"
          row-key="id"
          flat
          :loading="isLoading"
          class="custom-monitoring-table"
          :grid="$q.screen.xs"
          :pagination="{ rowsPerPage: 10 }"
        >
          <!-- No / Row Number -->
          <template #body-cell-index="props">
            <q-td :props="props" class="text-center text-weight-medium text-grey-7">
              {{ props.rowIndex + 1 }}
            </q-td>
          </template>

          <!-- Location -->
          <template #body-cell-location="props">
            <q-td :props="props">
              <div class="text-weight-bold text-grey-9">{{ props.row.location }}</div>
            </q-td>
          </template>

          <!-- Foto Laporan Kotor -->
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

          <!-- AI Analysis -->
          <template #body-cell-analisis="props">
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
                <span class="text-caption text-grey-8 text-weight-medium">
                  {{ props.row.aiAnalysis }}
                </span>
              </div>
            </q-td>
          </template>

          <!-- Report Time -->
          <template #body-cell-timestamp="props">
            <q-td :props="props">
              <span class="text-weight-medium text-grey-9">
                {{ formatDateTime(props.row.timestamp) }}
              </span>
            </q-td>
          </template>

          <!-- Bukti Bersih Masuk (Click to Redirect Detail) -->
          <template #body-cell-buktiBersih="props">
            <q-td :props="props">
              <div v-if="props.row.cleanProofCount > 0" class="row items-center justify-center">
                <q-chip
                  dense
                  clickable
                  color="positive"
                  text-color="white"
                  icon="verified"
                  class="cursor-pointer text-weight-bold shadow-1"
                  @click="goToDetail(props.row)"
                >
                  {{ props.row.cleanProofCount }} Proof{{ props.row.cleanProofCount > 1 ? 's' : '' }}
                  <q-tooltip>View clean proofs detail page</q-tooltip>
                </q-chip>
              </div>
              <div v-else class="text-caption text-grey-5 text-center">-</div>
            </q-td>
          </template>

          <!-- Handling Status -->
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
                  size="16px"
                  class="q-mr-xs"
                />
                <span>{{ props.row.status }}</span>
              </div>
            </q-td>
          </template>

          <!-- Actions / Alur Approve di Depan -->
          <template #body-cell-aksi="props">
            <q-td :props="props">
              <div class="row items-center justify-center q-gutter-x-xs no-wrap">
                <!-- Tombol Lihat Detail Bukti (Redirect ke Halaman Detail) -->
                <q-btn
                  flat
                  round
                  dense
                  color="primary"
                  icon="visibility"
                  @click="goToDetail(props.row)"
                >
                  <q-tooltip>View Clean Proofs Detail</q-tooltip>
                </q-btn>

                <!-- Tombol Approve Langsung di Depan -->
                <q-btn
                  v-if="props.row.status !== 'Resolved'"
                  flat
                  round
                  dense
                  color="positive"
                  icon="check_circle"
                  :loading="actionLoadingId === props.row.id"
                  @click="quickApproveReport(props.row)"
                >
                  <q-tooltip>Quick Approve (Mark as Resolved)</q-tooltip>
                </q-btn>

                <!-- Tombol Edit Catatan / Status -->
                <q-btn
                  flat
                  round
                  dense
                  color="orange-9"
                  icon="edit"
                  @click="openEditModal(props.row)"
                >
                  <q-tooltip>Edit Status & Admin Notes</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </template>

          <!-- Mobile Card View -->
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

                  <div class="row items-center q-gutter-x-xs">
                    <q-btn
                      flat
                      round
                      dense
                      color="primary"
                      icon="visibility"
                      size="sm"
                      @click="goToDetail(props.row)"
                    />
                    <q-btn
                      v-if="props.row.status !== 'Resolved'"
                      flat
                      round
                      dense
                      color="positive"
                      icon="check_circle"
                      size="sm"
                      @click="quickApproveReport(props.row)"
                    />
                    <q-btn
                      flat
                      round
                      dense
                      color="orange-9"
                      icon="edit"
                      size="sm"
                      @click="openEditModal(props.row)"
                    />
                  </div>
                </div>

                <div class="row items-center q-gutter-x-sm q-mb-sm">
                  <div class="table-img-wrapper cursor-pointer" @click="goToDetail(props.row)">
                    <ProxyImage :src="props.row.image" :alt="props.row.location" class="table-img" />
                  </div>
                  <div class="column">
                    <span class="text-subtitle2 text-weight-bold text-grey-9">{{ props.row.location }}</span>
                    <span class="text-caption text-grey-6" style="font-size: 11px">
                      {{ formatDateTime(props.row.timestamp) }}
                    </span>
                  </div>
                </div>

                <div class="q-mt-xs">
                  <q-chip
                    dense
                    size="sm"
                    :class="props.row.aiScore >= 0.5 ? 'bg-red-1 text-negative' : 'bg-green-1 text-positive'"
                    class="text-weight-bold font-chip q-mb-xs"
                  >
                    AI Score: {{ props.row.aiScore }}
                  </q-chip>
                  <q-chip
                    v-if="props.row.cleanProofCount > 0"
                    dense
                    size="sm"
                    color="positive"
                    text-color="white"
                    icon="verified"
                    class="text-weight-bold font-chip q-mb-xs q-ml-xs cursor-pointer"
                    @click="goToDetail(props.row)"
                  >
                    {{ props.row.cleanProofCount }} Clean Proof{{ props.row.cleanProofCount > 1 ? 's' : '' }}
                  </q-chip>
                  <div class="text-caption text-grey-8 text-weight-medium">
                    {{ props.row.aiAnalysis }}
                  </div>
                </div>
              </q-card>
            </div>
          </template>
        </q-table>
      </q-card>
    </div>

    <!-- Dialog Modal Edit Status / Catatan Admin -->
    <q-dialog v-model="showEditModal">
      <q-card style="width: 480px; max-width: 90vw" class="rounded-borders-lg bg-white overflow-hidden">
        <q-card-section class="row items-center justify-between bg-primary text-white q-py-sm">
          <div class="text-subtitle1 text-weight-bold">
            Edit Handling Status
          </div>
          <q-btn flat round dense icon="close" v-close-popup color="white" />
        </q-card-section>

        <q-card-section class="q-pa-lg" v-if="editingReport">
          <div class="text-subtitle2 text-grey-9 q-mb-xs">
            Location: <span class="text-weight-bold">{{ editingReport.location }}</span>
          </div>
          <div class="text-caption text-grey-6 q-mb-md">
            Update handling status and notes for this report.
          </div>

          <q-form @submit.prevent="saveStatus">
            <div class="q-mb-md">
              <div class="text-caption text-weight-bold text-grey-8 q-mb-xs">Handling Status</div>
              <q-select
                v-model="editForm.status"
                :options="['Pending', 'Resolved']"
                outlined
                dense
                emit-value
                map-options
              />
            </div>

            <div class="q-mb-md">
              <div class="text-caption text-weight-bold text-grey-8 q-mb-xs">
                Admin Notes (Optional)
              </div>
              <q-input
                v-model="editForm.notes"
                type="textarea"
                outlined
                rows="3"
                placeholder="Example: Cleaning team has collected waste at the location."
                dense
              />
            </div>

            <div class="row justify-end q-gutter-x-sm q-mt-md">
              <q-btn flat label="Cancel" no-caps color="grey-8" v-close-popup />
              <q-btn
                type="submit"
                color="primary"
                no-caps
                style="border-radius: 10px"
                label="Save Changes"
                icon="save"
                :loading="isSubmittingEdit"
              />
            </div>
          </q-form>
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
import placeholderImg from 'assets/placeholder.svg'

const router = useRouter()
const $q = useQuasar()
const cleanStore = useCleanReportsStore()

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
    name: 'index',
    label: 'No',
    field: 'id',
    align: 'center',
    style: 'width: 50px; font-weight: 600; color: #64748B;',
  },
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
    field: 'timestamp',
    align: 'left',
    sortable: true,
  },
  {
    name: 'buktiBersih',
    label: 'Clean Proofs',
    field: 'cleanProofCount',
    align: 'center',
    sortable: true,
  },
  {
    name: 'status',
    label: 'Handling Status',
    field: 'status',
    align: 'center',
    sortable: true,
  },
  {
    name: 'aksi',
    label: 'Actions',
    field: 'id',
    align: 'center',
  },
]

const allReports = ref([])
const destinationList = ref([])
const actionLoadingId = ref(null)

const showEditModal = ref(false)
const editingReport = ref(null)
const editForm = ref({ status: 'Pending', notes: '' })
const isSubmittingEdit = ref(false)

function openEditModal(report) {
  editingReport.value = report
  editForm.value.status = report.status
  editForm.value.notes = report.notes || ''
  showEditModal.value = true
}

/**
 * Redirect ke halaman detail laporan & bukti bersih
 */
function goToDetail(row) {
  sessionStorage.setItem(`monitoring_report_${row.id}`, JSON.stringify(row))
  router.push(`/admin/monitoring/${row.id}`)
}

function formatReportImage(url) {
  if (!url || typeof url !== 'string') return placeholderImg
  const target = url.trim()
  if (!target) return placeholderImg

  if (target.startsWith('data:') || target.startsWith('blob:') || target.startsWith('/assets/')) {
    return target
  }
  if (target.includes('/static/')) {
    return target.substring(target.indexOf('/static/'))
  }
  if (target.includes('/uploads/')) {
    return `/static${target.substring(target.indexOf('/uploads/'))}`
  }
  if (target.startsWith('http://') || target.startsWith('https://')) {
    return target
  }
  return `/static/${target.replace(/^\/+/, '')}`
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

function mapReport(item) {
  const score = item.score ?? item.ai_score ?? item.aiScore ?? 0
  const count = item.detected_count ?? item.detectedCount
  let analysis = item.ai_analysis || item.aiAnalysis || ''
  if (!analysis) {
    analysis = (count !== undefined && count !== null)
      ? (count > 0 ? `${count} waste objects detected` : 'No waste detected (Clean)')
      : (Number(score) >= 0.5 ? 'Dirty area detected' : 'Clean area')
  }

  const mapped = {
    id: item.id,
    destination_id: item.destination_id,
    location: resolveLocationName(item),
    image: formatReportImage(item.image_url || item.image || item.photo),
    aiScore: score,
    aiAnalysis: analysis,
    timestamp: item.created_at || item.timestamp || item.reported_at || '-',
    status: formatStatus(item.status),
    reporterNotes: item.user_notes || item.reporter_notes || item.description || '',
    notes: item.admin_notes || item.notes || '',
    raw: item,
  }

  const cleanMatches = cleanStore.getCleanReportsForDirtyReport(mapped)
  mapped.cleanReports = cleanMatches
  mapped.cleanProofCount = cleanMatches.length

  return mapped
}

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
  cleanStore.loadFromStorage()
  await Promise.all([
    fetchDestinations(),
    cleanStore.fetchCleanReports(),
  ])
  await fetchReports()
})

const filteredRows = computed(() => {
  return allReports.value.filter((row) => {
    const q = filterSearch.value.trim().toLowerCase()
    const matchSearch =
      !q ||
      String(row.id).includes(q) ||
      row.location.toLowerCase().includes(q) ||
      row.aiAnalysis.toLowerCase().includes(q) ||
      (row.reporterNotes || '').toLowerCase().includes(q)

    const matchStatus = filterStatus.value === 'All' || row.status === filterStatus.value
    return matchSearch && matchStatus
  })
})

/**
 * Alur Approve langsung di depan (Quick Approve)
 */
async function quickApproveReport(report) {
  actionLoadingId.value = report.id
  const reportId = report.id
  const payload = {
    status: 'resolved',
    admin_notes: 'Report resolved directly by admin via monitoring',
    notes: 'Report resolved directly by admin via monitoring',
  }
  const reqConfig = { headers: { 'ngrok-skip-browser-warning': 'true' } }

  try {
    try {
      await api.put(`/reports/${reportId}`, payload, reqConfig)
    } catch {
      await api.put(`/reports/${reportId}/`, payload, reqConfig)
    }

    report.status = 'Resolved'
    $q.notify({
      type: 'positive',
      message: `Report #${reportId} (${report.location}) successfully approved & Resolved!`,
      position: 'top',
    })
  } catch (err) {
    console.error('Failed to quick approve report:', err)
    $q.notify({
      type: 'negative',
      message: 'Failed to update report status to backend.',
      position: 'top',
    })
  } finally {
    actionLoadingId.value = null
  }
}

/**
 * Simpan edit status dan catatan admin
 */
async function saveStatus() {
  if (!editingReport.value) return
  isSubmittingEdit.value = true

  const reportId = editingReport.value.id
  const targetStatus = editForm.value.status
  const targetNotes = editForm.value.notes || ''
  const payload = {
    status: targetStatus.toLowerCase(),
    admin_notes: targetNotes,
    notes: targetNotes,
  }
  const reqConfig = { headers: { 'ngrok-skip-browser-warning': 'true' } }

  try {
    try {
      await api.put(`/reports/${reportId}`, payload, reqConfig)
    } catch {
      await api.put(`/reports/${reportId}/`, payload, reqConfig)
    }

    editingReport.value.status = targetStatus
    editingReport.value.notes = targetNotes
    showEditModal.value = false

    $q.notify({
      type: 'positive',
      message: `Report #${reportId} status successfully updated to ${targetStatus}!`,
      position: 'top',
    })
  } catch (err) {
    console.error('Failed to save status:', err)
    $q.notify({
      type: 'negative',
      message: 'Failed to update report status to backend.',
      position: 'top',
    })
  } finally {
    isSubmittingEdit.value = false
  }
}
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

  @media (max-width: 599px) {
    margin-top: 0.5rem;
  }
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

  &:hover {
    transform: scale(1.05);
  }
}

.table-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.font-chip {
  font-size: 11px;
}

.style-fit-content {
  width: fit-content;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.status-handled {
  background-color: #f2f6e9;
  color: #5f702e;
  border: 1px solid #c8d89c;
}

.status-pending {
  background-color: #fffbeb;
  color: #b45309;
  border: 1px solid #fde68a;
}
</style>

<style lang="scss">
.custom-monitoring-table {
  thead tr th {
    font-weight: 700 !important;
    font-size: 13px !important;
    color: #475569 !important;
    background-color: #f8fafc !important;
  }

  tbody tr td {
    font-size: 13px !important;
  }
}
</style>
