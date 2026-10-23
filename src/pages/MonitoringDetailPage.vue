<template>
  <q-page class="page-container bg-grey-2">
    <div class="max-width-container">
      <div class="row items-center justify-between q-mb-sm">
        <div class="col-12 col-md-auto q-mb-sm-res">
          <div class="row items-center q-gutter-x-sm q-mb-xs">
            <q-btn
              flat
              dense
              no-caps
              icon="arrow_back"
              color="grey-8"
              label="Monitoring"
              to="/admin/monitoring"
              class="q-px-xs"
            />
          </div>
          <h1 class="text-weight-bold text-grey-9 q-ma-none font-header">
            {{ destinationName }}
          </h1>
          <p class="text-grey-7 q-mt-xs q-mb-none font-subtitle">
            List of waste reports for this destination
          </p>
        </div>
      </div>

      <div class="row items-center justify-between q-col-gutter-sm q-my-md">
        <div class="col-12 col-sm-7 col-md-5">
          <q-input
            v-model="filterSearch"
            placeholder="Search report..."
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

      <q-banner
        v-if="baselineInfo"
        rounded
        class="baseline-banner q-mb-md"
      >
        <template #avatar>
          <q-icon name="verified" color="positive" size="28px" />
        </template>
        <div class="text-weight-bold text-grey-9 q-mb-xs" style="font-size: 13.5px;">
          Menampilkan laporan kotor <span class="text-positive">setelah verifikasi kebersihan</span>
        </div>
        <div class="text-caption text-grey-7" style="line-height: 1.5;">
          Destinasi ini telah dikonfirmasi bersih pada
          <strong class="text-grey-9">{{ baselineInfo.label }}</strong>.
          <template v-if="baselineInfo.hiddenCount > 0">
            <span class="text-amber-9 text-weight-bold">
              {{ baselineInfo.hiddenCount }} laporan lama
            </span>
            sebelum tanggal tersebut tidak ditampilkan karena sudah tidak relevan.
          </template>
          <template v-else>
            Belum ada laporan kotor baru setelah verifikasi.
          </template>
        </div>
      </q-banner>

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

          <template #body-cell-timestamp="props">
            <q-td :props="props">
              <span class="text-weight-medium text-grey-9">
                {{ formatDateTime(props.row.timestamp) }}
              </span>
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
                    <q-btn flat round dense color="primary" icon="visibility" size="sm" @click="openDetailModal(props.row)" />
                    <q-btn flat round dense color="orange-9" icon="edit" size="sm" @click="openEditModal(props.row)" />
                  </div>
                </div>
                <div class="row items-center q-gutter-x-sm q-mb-sm">
                  <div class="table-img-wrapper cursor-pointer" @click="openDetailModal(props.row)">
                    <ProxyImage :src="props.row.image" :alt="props.row.location" class="table-img" />
                  </div>
                  <div class="column">
                    <span class="text-subtitle2 text-weight-bold text-grey-9">{{ props.row.location }}</span>
                    <span class="text-caption text-grey-6" style="font-size: 11px">{{ props.row.timestamp }}</span>
                  </div>
                </div>
                <div class="q-mt-xs">
                  <q-chip dense size="sm"
                    :class="props.row.aiScore >= 0.5 ? 'bg-red-1 text-negative' : 'bg-green-1 text-positive'"
                    class="text-weight-bold font-chip q-mb-xs"
                  >
                    AI Score: {{ props.row.aiScore }}
                  </q-chip>
                  <div class="text-caption text-grey-8 text-weight-medium">{{ props.row.aiAnalysis }}</div>
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
            <ProxyImage :src="selectedReport.image" :alt="selectedReport.location" class="modal-img-blur" />
            <ProxyImage :src="selectedReport.image" :alt="selectedReport.location" class="modal-img" />
          </div>

          <div class="row q-col-gutter-md">
            <div class="col-12 col-sm-6">
              <div class="text-caption text-grey-7">Destination Location</div>
              <div class="text-subtitle2 text-weight-bold text-grey-9">{{ selectedReport.location }}</div>
            </div>
            <div class="col-12 col-sm-6">
              <div class="text-caption text-grey-7">Report Time</div>
              <div class="text-subtitle2 text-weight-bold text-grey-9">{{ formatDateTime(selectedReport.timestamp) }}</div>
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
import { useRoute } from 'vue-router'
import { useCleanReportsStore } from 'src/stores/cleanReports'
import { api } from 'boot/axios'
import StatusDialog from 'components/StatusDialog.vue'
import ProxyImage from 'components/ProxyImage.vue'
import report1Img from 'assets/report1.jpg'

const route = useRoute()
const cleanStore = useCleanReportsStore()

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
const isLoadingDetail = ref(false)

const showEditModal = ref(false)
const editingReport = ref(null)
const editForm = ref({ status: 'Resolved', notes: '' })
const isSubmittingEditStatus = ref(false)

const showStatusFeedback = ref(false)
const feedbackConfig = ref({ type: 'success', title: '', message: '' })

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

const destinationId = route.params.destinationId
const destinationName = ref('')
const reports = ref([])
const destinationList = ref([])

const baselineInfo = ref(null)

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

async function loadReports() {
  if (destinationList.value.length === 0) {
    await fetchDestinations()
  }

  const cached = sessionStorage.getItem(`monitoring_dest_${destinationId}`)
  if (cached) {
    try {
      const data = JSON.parse(cached)
      let resolvedLoc = data.location || ''
      if (!resolvedLoc || resolvedLoc.startsWith('Destination #') || resolvedLoc === 'Destinasi') {
        const found = destinationList.value.find((d) => String(d.id || d.destination_id) === String(destinationId))
        if (found) {
          resolvedLoc = found.name || resolvedLoc
        }
      }
      destinationName.value = resolvedLoc || destinationId

      reports.value = (data.reports || []).map((r) => {
        let locName = r.location
        if (!locName || locName.startsWith('Destination #')) {
          const found = destinationList.value.find((d) => String(d.id || d.destination_id) === String(r.destination_id || destinationId))
          if (found) locName = found.name
        }
        return {
          ...r,
          location: locName || r.location || destinationName.value,
          timestamp: formatDateTime(r.timestamp || r.created_at || '-'),
        }
      })

      if (data.baselineVerifiedAt) {
        const hiddenCount = (data.totalDirtyAll || 0) - (data.totalDirtyFiltered || reports.value.length)
        baselineInfo.value = {
          label: data.baselineLabel || formatDateTime(data.baselineVerifiedAt),
          hiddenCount: Math.max(0, hiddenCount),
        }
      } else {
        baselineInfo.value = null
      }

      const hasPending = reports.value.some((r) => r.status !== 'Resolved')
      if (!hasPending && reports.value.length > 0) {
        cleanStore.resolveCleanReportsForDestination(destinationId, destinationName.value)
      }
      return
    } catch {
      // Fallback: fetch from API
    }
  }

  isLoading.value = true
  try {
    await fetchDestinations()
    let res
    try { res = await api.get('/reports') } catch { res = await api.get('/reports/') }
    const raw = res.data?.data || res.data || []
    const all = (Array.isArray(raw) ? raw : []).map(mapReport)

    const filtered = all.filter((r) => {
      if (r.destination_id !== null && r.destination_id !== undefined) {
        return String(r.destination_id) === destinationId
      }
      return r.location === destinationId 
    })

    if (filtered.length > 0) {
      destinationName.value = filtered[0].location
      reports.value = filtered
      const hasPending = filtered.some((r) => r.status !== 'Resolved')
      if (!hasPending) {
        cleanStore.resolveCleanReportsForDestination(destinationId, destinationName.value)
      }
    } else {
      const found = destinationList.value.find((d) => String(d.id || d.destination_id) === String(destinationId))
      destinationName.value = found ? found.name : destinationId
      reports.value = []
    }
  } catch (err) {
    console.error('Failed to load reports:', err)
    reports.value = []
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  await fetchDestinations()
  await loadReports()
})

const filteredReports = computed(() => {
  return reports.value.filter((item) => {
    const q = filterSearch.value.trim().toLowerCase()
    const matchSearch =
      !q ||
      item.location.toLowerCase().includes(q) ||
      item.aiAnalysis.toLowerCase().includes(q) ||
      (item.reporterNotes || '').toLowerCase().includes(q)
    const matchStatus = filterStatus.value === 'All' || item.status === filterStatus.value
    return matchSearch && matchStatus
  })
})

const openDetailModal = async (report) => {
  let initialLoc = report.location
  if (!initialLoc || initialLoc.startsWith('Destination #')) {
    const found = destinationList.value.find((d) => String(d.id || d.destination_id) === String(report.destination_id || destinationId))
    if (found) initialLoc = found.name
  }

  selectedReport.value = {
    ...report,
    location: initialLoc || report.location,
  }
  showDetailModal.value = true
  isLoadingDetail.value = true

  const reportId = report.id
  try {
    let res
    try { res = await api.get(`/reports/${reportId}`) } catch { res = await api.get(`/reports/${reportId}/`) }
    const detail = res.data?.data || res.data || {}
    if (detail && typeof detail === 'object') {
      const mapped = mapReport({ ...report.raw, ...detail })
      let finalLoc = mapped.location !== '-' ? mapped.location : report.location
      if (!finalLoc || finalLoc.startsWith('Destination #')) {
        const found = destinationList.value.find((d) => String(d.id || d.destination_id) === String(report.destination_id || detail.destination_id || destinationId))
        if (found) finalLoc = found.name
      }
      selectedReport.value = {
        ...report,
        ...mapped,
        location: finalLoc || report.location,
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
    const rep = selectedReport.value
    showDetailModal.value = false
    openEditModal(rep)
  }
}

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

  const reqConfig = { headers: { 'ngrok-skip-browser-warning': 'true' } }

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
      } catch (e) { lastError = e }
    }
  } catch (err) { lastError = err }

  isSubmittingEditStatus.value = false

  const index = reports.value.findIndex((r) => r.id === reportId)
  if (index !== -1) {
    reports.value[index].status = targetStatus
    reports.value[index].notes = targetNotes
  }
  if (selectedReport.value?.id === reportId) {
    selectedReport.value.status = targetStatus
    selectedReport.value.notes = targetNotes
  }

  const cachedKey = `monitoring_dest_${destinationId}`
  const cachedVal = sessionStorage.getItem(cachedKey)
  if (cachedVal) {
    try {
      const data = JSON.parse(cachedVal)
      data.reports = reports.value
      sessionStorage.setItem(cachedKey, JSON.stringify(data))
    } catch {
      // Ignore sessionStorage parsing error
    }
  }

  if (targetStatus === 'Resolved') {
    cleanStore.resolveCleanReportsForDestination(
      destinationId,
      destinationName.value || editingReport.value?.location
    )
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

.baseline-banner {
  background-color: #f0fdf4;
  border: 1.5px solid #bbf7d0;
  border-radius: 12px;
  padding: 12px 16px;
}

.modal-img-container {
  position: relative;
  width: 100%;
  height: 260px;
  border-radius: 12px;
  overflow: hidden;
  background-color: #000;
}

.modal-img-blur {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  object-fit: cover;
  filter: blur(20px);
  opacity: 0.4;
  transform: scale(1.1);
}

.modal-img {
  position: relative;
  width: 100%; height: 100%;
  object-fit: contain;
  z-index: 1;
}

.rounded-borders-lg { border-radius: 20px; }
</style>
