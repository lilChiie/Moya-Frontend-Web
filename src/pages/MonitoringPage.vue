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
          :rows="filteredReports"
          :columns="columns"
          row-key="id"
          flat
          :loading="isLoading"
          class="custom-monitoring-table"
          :grid="$q.screen.xs"
          :pagination="{ rowsPerPage: 10 }"
        >
          <template #body-cell-foto="props">
            <q-td :props="props">
              <div class="table-img-wrapper cursor-pointer" @click="openDetailModal(props.row)">
                <img :src="props.row.image" :alt="props.row.location" class="table-img" />
              </div>
            </q-td>
          </template>
          <template #body-cell-analisis="props">
            <q-td :props="props">
              <div class="column">
                <q-chip
                  dense
                  size="sm"
                  :class="
                    props.row.aiScore >= 0.5 ? 'bg-red-1 text-negative' : 'bg-green-1 text-positive'
                  "
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

          <template #body-cell-aksi="props">
            <q-td :props="props">
              <div class="row items-center q-gutter-x-xs">
                <q-btn
                  flat
                  round
                  dense
                  color="primary"
                  icon="visibility"
                  @click="openDetailModal(props.row)"
                >
                  <q-tooltip>View Report Details</q-tooltip>
                </q-btn>

                <q-btn
                  flat
                  round
                  dense
                  color="orange-9"
                  icon="edit"
                  @click="openEditModal(props.row)"
                >
                  <q-tooltip>Edit Handling Status</q-tooltip>
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
                      @click="openDetailModal(props.row)"
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
                  <div class="table-img-wrapper cursor-pointer" @click="openDetailModal(props.row)">
                    <img :src="props.row.image" :alt="props.row.location" class="table-img" />
                  </div>
                  <div class="column">
                    <span class="text-subtitle2 text-weight-bold text-grey-9">{{
                      props.row.location
                    }}</span>
                    <span class="text-caption text-grey-6" style="font-size: 11px">{{
                      props.row.timestamp
                    }}</span>
                  </div>
                </div>

                <div class="q-mt-xs">
                  <q-chip
                    dense
                    size="sm"
                    :class="
                      props.row.aiScore >= 0.5
                        ? 'bg-red-1 text-negative'
                        : 'bg-green-1 text-positive'
                    "
                    class="text-weight-bold font-chip q-mb-xs"
                  >
                    AI Score: {{ props.row.aiScore }}
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

    <q-dialog v-model="showDetailModal">
      <q-card style="width: 600px; max-width: 90vw" class="rounded-borders-lg q-pb-lg">
        <q-card-section class="row items-center justify-between bg-primary text-white q-py-sm">
          <div class="text-subtitle1 text-weight-bold q-pa-sm">
            Report Details - {{ selectedReport?.location }}
          </div>
          <q-btn flat round dense icon="close" v-close-popup color="white" />
        </q-card-section>

        <q-card-section class="q-pa-lg relative-position" v-if="selectedReport">
          <q-inner-loading :showing="isLoadingDetail">
            <q-spinner-dots size="40px" color="primary" />
          </q-inner-loading>
          <div class="modal-img-container q-mb-md">
            <img :src="selectedReport.image" :alt="selectedReport.location" class="modal-img-blur" />
            <img :src="selectedReport.image" :alt="selectedReport.location" class="modal-img" />
          </div>

          <div class="row q-col-gutter-md">
            <div class="col-12 col-sm-6">
              <div class="text-caption text-grey-7">Destination Location</div>
              <div class="text-subtitle2 text-weight-bold text-grey-9">
                {{ selectedReport.location }}
              </div>
            </div>

            <div class="col-12 col-sm-6">
              <div class="text-caption text-grey-7">Report Time</div>
              <div class="text-subtitle2 text-weight-bold text-grey-9">
                {{ selectedReport.timestamp }}
              </div>
            </div>

            <div class="col-12 col-sm-6">
              <div class="text-caption text-grey-7">AI Analysis Result</div>
              <div class="text-subtitle2 text-weight-bold text-primary">
                {{ selectedReport.aiAnalysis }} (Score: {{ selectedReport.aiScore }})
              </div>
            </div>

            <div class="col-12 col-sm-6">
              <div class="text-caption text-grey-7">Handling Status</div>
              <div>
                <div
                  :class="[
                    'status-pill',
                    selectedReport.status === 'Resolved' ? 'status-handled' : 'status-pending',
                  ]"
                  class="q-mt-xs"
                >
                  <q-icon
                    :name="selectedReport.status === 'Resolved' ? 'check_circle' : 'pending'"
                    size="16px"
                    class="q-mr-xs"
                  />
                  <span>{{ selectedReport.status }}</span>
                </div>
              </div>
            </div>

            <div class="col-12" v-if="selectedReport.reporterNotes">
              <div class="text-caption text-grey-7">Reporter Notes</div>
              <div
                class="text-body2 text-grey-8 bg-blue-1 q-pa-sm rounded-borders text-italic"
                style="border: 1px solid #bfdbfe"
              >
                "{{ selectedReport.reporterNotes }}"
              </div>
            </div>

            <div class="col-12" v-if="selectedReport.notes">
              <div class="text-caption text-grey-7">Admin Notes</div>
              <div class="text-body2 text-grey-8 bg-grey-2 q-pa-sm rounded-borders">
                {{ selectedReport.notes }}
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md bg-grey-1">
          <q-btn flat no-caps label="Close" color="grey-8" v-close-popup />
          <q-btn
            color="primary"
            label="Change Status"
            icon="edit"
            no-caps
            style="border-radius: 12px"
            @click="switchFromDetailToEdit"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showEditModal">
      <q-card style="width: 480px; max-width: 90vw" class="rounded-borders-lg q-pb-md">
        <q-card-section class="row items-center justify-between bg-primary text-white q-py-sm">
          <div class="text-subtitle1 text-weight-bold">Edit Handling Status</div>
          <q-btn flat round dense icon="close" v-close-popup color="white" />
        </q-card-section>

        <q-card-section class="q-pa-lg" v-if="editingReport">
          <div class="text-subtitle2 text-grey-9 q-mb-xs">
            Location: <span class="text-weight-bold">{{ editingReport.location }}</span>
          </div>
          <div class="text-caption text-grey-6 q-mb-md">
            Update report status to "Resolved" once cleaning is completed by ground staff.
          </div>

          <q-form @submit.prevent="saveStatus">
            <div class="q-mb-md">
              <div class="text-caption text-weight-bold text-grey-8 q-mb-xs">Report Status</div>
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
                placeholder="Example: Cleaning team resolved waste issue at location at 16:00 WIB."
                dense
              />
            </div>

            <div class="row justify-end q-gutter-x-sm q-mt-md">
              <q-btn flat label="Cancel" no-caps color="grey-8" v-close-popup />
              <q-btn
                type="submit"
                color="primary"
                no-caps
                style="border-radius: 12px"
                label="Save Changes"
                icon="save"
                :loading="isSubmittingEditStatus"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <StatusDialog
      v-model="showStatusFeedback"
      :type="feedbackConfig.type"
      :title="feedbackConfig.title"
      :message="feedbackConfig.message"
    />
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { api } from 'boot/axios'
import StatusDialog from 'components/StatusDialog.vue'

import report1Img from 'assets/report1.jpg'

const isLoading = ref(false)
const filterSearch = ref('')
const filterStatus = ref('All')
const statusOptions = [
  { label: 'All Statuses', value: 'All' },
  { label: 'Pending', value: 'Pending' },
  { label: 'Resolved', value: 'Resolved' },
]

const showDetailModal = ref(false)
const selectedReport = ref(null)

const showEditModal = ref(false)
const editingReport = ref(null)
const editForm = ref({
  status: 'Resolved',
  notes: '',
})

const showStatusFeedback = ref(false)
const feedbackConfig = ref({
  type: 'success',
  title: '',
  message: '',
})

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
    field: 'aiAnalysis',
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

const reports = ref([])
const destinationList = ref([])

async function fetchDestinations() {
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
    console.error('Failed to fetch destinations list in MonitoringPage:', e)
  }
}

function formatReportImage(url) {
  if (!url || typeof url !== 'string') return report1Img
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:image/')) {
    if (url.includes('ngrok-free.app') && !url.includes('ngrok-skip-browser-warning')) {
      const sep = url.includes('?') ? '&' : '?'
      return `${url}${sep}ngrok-skip-browser-warning=true`
    }
    return url
  }
  const baseURL = api.defaults.baseURL || 'https://a439-103-164-80-87.ngrok-free.app'
  let origin = ''
  if (baseURL.startsWith('http://') || baseURL.startsWith('https://')) {
    try {
      const parsedUrl = new URL(baseURL)
      origin = parsedUrl.origin
    } catch {
      origin = baseURL.replace(/\/api\/?$/, '').replace(/\/$/, '')
    }
  } else {
    origin = 'https://a439-103-164-80-87.ngrok-free.app'
  }
  const path = url.startsWith('/') ? url : `/${url}`
  const fullUrl = `${origin}${path}`
  const sep = fullUrl.includes('?') ? '&' : '?'
  return `${fullUrl}${sep}ngrok-skip-browser-warning=true`
}

function formatStatus(st) {
  if (!st) return 'Pending'
  const str = String(st).toLowerCase()
  if (str === 'resolved' || str === 'handled' || str === 'clean') return 'Resolved'
  return 'Pending'
}

function resolveLocationName(item) {
  let locationName = item.destination_name || item.destination?.name || item.location || item.name || ''

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

  return locationName || '-'
}

function formatReportDate(dateStr) {
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

function mapReportItem(item) {
  const scoreVal = item.score ?? item.ai_score ?? item.aiScore ?? 0
  const countVal = item.detected_count ?? item.detectedCount
  let aiText = item.ai_analysis || item.aiAnalysis || item.analysis || ''
  if (!aiText) {
    if (countVal !== undefined && countVal !== null) {
      aiText = countVal > 0 ? `${countVal} waste objects detected` : 'No waste detected (Clean)'
    } else {
      aiText = Number(scoreVal) >= 0.5 ? 'Dirty area detected' : 'Clean area'
    }
  }

  const rawDate = item.created_at || item.timestamp || item.reported_at || '-'

  return {
    id: item.id,
    destination_id: item.destination_id,
    user_id: item.user_id,
    location: resolveLocationName(item),
    image: formatReportImage(item.image_url || item.image || item.photo),
    aiScore: scoreVal,
    aiAnalysis: aiText,
    timestamp: formatReportDate(rawDate),
    status: formatStatus(item.status),
    reporterNotes: item.user_notes || item.reporter_notes || item.reporterNotes || item.description || '',
    notes: item.admin_notes || item.notes || '',
    raw: item,
  }
}

async function fetchReports() {
  isLoading.value = true
  try {
    let res
    try {
      res = await api.get('/reports/')
    } catch {
      res = await api.get('/reports')
    }

    const rawData = res.data?.data || res.data || []
    const list = Array.isArray(rawData) ? rawData : []

    reports.value = list.map((item) => mapReportItem(item))
  } catch (err) {
    console.error('Failed to fetch reports:', err)
    reports.value = []
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  await fetchDestinations()
  await fetchReports()
})

const filteredReports = computed(() => {
  return reports.value.filter((item) => {
    const matchSearch =
      item.location.toLowerCase().includes(filterSearch.value.toLowerCase()) ||
      item.aiAnalysis.toLowerCase().includes(filterSearch.value.toLowerCase())
    const matchStatus = filterStatus.value === 'All' || item.status === filterStatus.value

    return matchSearch && matchStatus
  })
})

const isLoadingDetail = ref(false)

const openDetailModal = async (report) => {
  selectedReport.value = report
  showDetailModal.value = true
  isLoadingDetail.value = true

  const reportId = report.id
  try {
    let res
    try {
      res = await api.get(`/reports/${reportId}`)
    } catch {
      res = await api.get(`/reports/${reportId}/`)
    }

    const detail = res.data?.data || res.data || {}
    if (detail && typeof detail === 'object') {
      const mapped = mapReportItem({ ...report.raw, ...detail })
      selectedReport.value = {
        ...report,
        ...mapped,
        location: mapped.location !== '-' ? mapped.location : report.location,
      }
    }
  } catch (err) {
    console.error(`Failed to fetch report detail for ID ${reportId}:`, err)
  } finally {
    isLoadingDetail.value = false
  }
}

const openEditModal = (report) => {
  editingReport.value = report
  editForm.value.status = report.status
  editForm.value.notes = report.notes || ''
  showEditModal.value = true
}

const switchFromDetailToEdit = () => {
  if (selectedReport.value) {
    const reportToEdit = selectedReport.value
    showDetailModal.value = false
    openEditModal(reportToEdit)
  }
}

const isSubmittingEditStatus = ref(false)

const saveStatus = async () => {
  if (!editingReport.value) return
  isSubmittingEditStatus.value = true

  const reportId = editingReport.value.id
  const targetStatus = editForm.value.status
  const targetNotes = editForm.value.notes || ''

  const payload = {
    status: targetStatus.toLowerCase(),
    admin_notes: targetNotes,
    notes: targetNotes,
  }

  const reqConfig = {
    headers: {
      'ngrok-skip-browser-warning': 'true',
    },
  }

  let apiSuccess = false
  let lastError = null

  try {
    try {
      await api.put(`/reports/${reportId}`, payload, reqConfig)
      apiSuccess = true
    } catch {
      try {
        await api.put(`/reports/${reportId}/`, payload, reqConfig)
        apiSuccess = true
      } catch (e) {
        lastError = e
      }
    }
  } catch (err) {
    lastError = err
  }

  isSubmittingEditStatus.value = false

  const index = reports.value.findIndex((r) => r.id === reportId)
  if (index !== -1) {
    reports.value[index].status = targetStatus
    reports.value[index].notes = targetNotes
  }
  if (selectedReport.value && selectedReport.value.id === reportId) {
    selectedReport.value.status = targetStatus
    selectedReport.value.notes = targetNotes
  }

  const reportLoc = editingReport.value?.location || 'The report'
  showEditModal.value = false

  if (apiSuccess) {
    feedbackConfig.value = {
      type: 'success',
      title: 'Report Status Updated',
      message: `Status for "${reportLoc}" has been successfully updated to "${targetStatus}".`,
    }
  } else {
    console.error('Error updating report status on server:', lastError)
    const errStatus = lastError?.response?.status ? ` (HTTP ${lastError.response.status})` : ''
    feedbackConfig.value = {
      type: 'error',
      title: 'Failed to Update Status (Server Error)',
      message: `Gagal memperbarui status di server backend${errStatus}. Tampilan lokal telah diperbarui secara sementara.`,
    }
  }
  showStatusFeedback.value = true
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

.modal-img-container {
  width: 100%;
  height: 320px;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  background-color: #0f172a;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.modal-img-blur {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: blur(20px) brightness(0.5);
  transform: scale(1.15);
  pointer-events: none;
}

.modal-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  position: relative;
  z-index: 1;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
  border-radius: 8px;
}

.style-fit-content {
  width: fit-content;
}

.rounded-borders-lg {
  border-radius: 16px;
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
