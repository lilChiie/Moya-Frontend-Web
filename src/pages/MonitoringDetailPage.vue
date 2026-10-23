<template>
  <q-page class="page-container bg-grey-2">
    <div class="max-width-container">
      <!-- Back Navigation Header -->
      <div class="row items-center justify-between q-mb-md">
        <div class="col-12 col-md-auto q-mb-sm-res">
          <div class="row items-center q-gutter-x-sm q-mb-xs">
            <q-btn
              flat
              dense
              no-caps
              icon="arrow_back"
              color="grey-8"
              label="Back to Monitoring"
              to="/admin/monitoring"
              class="q-px-xs text-weight-medium"
            />
          </div>
          <h1 class="text-weight-bold text-grey-9 q-ma-none font-header">
            Report Details & Clean Proofs
          </h1>
          <p class="text-grey-7 q-mt-xs q-mb-none font-subtitle">
            Condition details for {{ currentReport?.location || 'Destination' }} and clean proofs from users
          </p>
        </div>

        <!-- Quick Action: Approve / Change Status -->
        <div class="col-12 col-md-auto row items-center q-gutter-sm">
          <q-btn
            v-if="currentReport && currentReport.status !== 'Resolved'"
            color="positive"
            icon="check_circle"
            label="Approve & Resolve"
            no-caps
            unelevated
            class="text-weight-bold"
            style="border-radius: 10px; padding: 8px 16px"
            :loading="isSubmittingStatus"
            @click="quickApprove"
          >
            <q-tooltip>Mark this report as resolved</q-tooltip>
          </q-btn>

          <q-btn
            outline
            color="orange-9"
            icon="edit"
            label="Update Status"
            no-caps
            class="text-weight-bold"
            style="border-radius: 10px; padding: 8px 16px"
            @click="openEditModal"
          />
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="text-center q-py-xl">
        <q-spinner-dots size="48px" color="primary" />
        <div class="text-grey-7 q-mt-sm">Loading report details & clean proofs...</div>
      </div>

      <!-- Main Content -->
      <div v-else-if="currentReport" class="column q-gutter-y-lg">
        <!-- Card 1: Kondisi Laporan Kotor Awal -->
        <q-card flat class="content-card q-pa-lg">
          <div class="row items-center justify-between q-mb-md border-bottom q-pb-sm">
            <div class="row items-center q-gutter-x-sm">
              <span class="text-h6 text-weight-bold text-grey-9">Initial Dirty Report Condition</span>
              
            </div>

            <div
              :class="[
                'status-pill',
                currentReport.status === 'Resolved' ? 'status-handled' : 'status-pending',
              ]"
            >
              <q-icon
                :name="currentReport.status === 'Resolved' ? 'check_circle' : 'pending'"
                size="16px"
                class="q-mr-xs"
              />
              <span>{{ currentReport.status }}</span>
            </div>
          </div>

          <div class="row q-col-gutter-lg items-center">
            <!-- Left: Foto Laporan Kotor -->
            <div class="col-12 col-md-5 col-lg-4 text-center">
              <div
                class="detail-img-box cursor-pointer"
                @click="openImageZoom(currentReport.image, 'Dirty Report - ' + currentReport.location)"
              >
                <ProxyImage :src="currentReport.image" :alt="currentReport.location" class="detail-img" />
                <div class="detail-img-overlay">
                  <q-icon name="zoom_in" color="white" size="24px" />
                  <span class="text-white text-caption q-ml-xs">Click to enlarge</span>
                </div>
              </div>
            </div>

            <!-- Right: Info Detail Laporan Kotor -->
            <div class="col-12 col-md-7 col-lg-8">
              <div class="row q-col-gutter-y-sm">
                

                <div class="col-12 col-sm-6">
                  <div class="text-caption text-grey-7 text-weight-medium">Destination Location</div>
                  <div class="text-subtitle1 text-weight-bold text-grey-9">{{ currentReport.location }}</div>
                </div>

                <div class="col-12 col-sm-6">
                  <div class="text-caption text-grey-7 text-weight-medium">Report Time</div>
                  <div class="text-body2 text-weight-medium text-grey-9">{{ formatDateTime(currentReport.timestamp) }}</div>
                </div>

                <div class="col-12 col-sm-6">
                  <div class="text-caption text-grey-7 text-weight-medium">AI Detection Analysis</div>
                  <div class="row items-center q-gutter-x-xs q-mt-xs">
                    <q-chip
                      dense
                      size="sm"
                      :class="currentReport.aiScore >= 0.5 ? 'bg-red-1 text-negative' : 'bg-green-1 text-positive'"
                      class="text-weight-bold font-chip"
                    >
                      AI Score: {{ currentReport.aiScore }}
                    </q-chip>
                    <span class="text-body2 text-grey-8">{{ currentReport.aiAnalysis }}</span>
                  </div>
                </div>

                <div class="col-12 col-sm-6">
                  <div class="text-caption text-grey-7 text-weight-medium">Attached Clean Proofs</div>
                  <div class="row items-center q-gutter-x-xs q-mt-xs">
                    <q-chip
                      dense
                      color="positive"
                      text-color="white"
                      icon="verified"
                      class="text-weight-bold font-chip"
                    >
                      {{ cleanProofsList.length }} Clean Proof{{ cleanProofsList.length > 1 ? 's' : '' }} Submitted
                    </q-chip>
                  </div>
                </div>

                <div class="col-12" v-if="currentReport.reporterNotes">
                  <div class="text-caption text-grey-7 text-weight-medium">Initial Reporter Notes</div>
                  <div class="text-body2 text-grey-8 bg-grey-2 q-pa-sm rounded-borders q-mt-xs">
                    "{{ currentReport.reporterNotes }}"
                  </div>
                </div>

                <div class="col-12" v-if="currentReport.notes">
                  <div class="text-caption text-grey-7 text-weight-medium">Admin Notes</div>
                  <div class="text-body2 text-grey-8 bg-blue-1 q-pa-sm rounded-borders q-mt-xs" style="border: 1px solid #bfdbfe">
                    {{ currentReport.notes }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </q-card>

        <!-- Card 2: Bukti Pembersihan dari Pengguna -->
        <q-card flat class="content-card q-pa-lg">
          <div class="row items-center justify-between q-mb-md border-bottom q-pb-sm">
            <div class="row items-center q-gutter-x-sm">
              <q-icon name="verified" color="positive" size="24px" />
              <span class="text-h6 text-weight-bold text-grey-9">
                User Clean Proofs ({{ cleanProofsList.length }} Photo{{ cleanProofsList.length > 1 ? 's' : '' }})
              </span>
            </div>
            <div class="text-caption text-grey-6">
              Photos and notes submitted by users after the area was cleaned
            </div>
          </div>

          <!-- Empty State Clean Proofs -->
          <div v-if="cleanProofsList.length === 0" class="text-center q-py-xl bg-grey-1 rounded-borders">
            <q-icon name="photo_library" size="48px" color="grey-4" />
            <div class="text-subtitle1 text-weight-bold text-grey-7 q-mt-sm">No Clean Proofs Submitted Yet</div>
            <div class="text-caption text-grey-5 q-mt-xs">
              No users have uploaded clean proof photos for this dirty report yet.
            </div>
          </div>

          <!-- Table of Clean Proofs -->
          <div v-else>
            <q-table
              :rows="cleanProofsList"
              :columns="cleanColumns"
              row-key="id"
              flat
              class="custom-proof-table"
              :pagination="{ rowsPerPage: 10 }"
            >
              <!-- No / Row Number -->
              <template #body-cell-index="props">
                <q-td :props="props" class="text-center text-weight-medium text-grey-7">
                  {{ props.rowIndex + 1 }}
                </q-td>
              </template>

              <!-- Foto Bukti -->
              <template #body-cell-foto="props">
                <q-td :props="props">
                  <div
                    class="proof-table-img-box cursor-pointer"
                    @click="openImageZoom(props.row.image_url, 'Clean Proof - ' + props.row.reporter_name)"
                  >
                    <ProxyImage :src="props.row.image_url" :alt="props.row.reporter_name" class="proof-table-img" />
                    <div class="proof-table-img-overlay">
                      <q-icon name="zoom_in" color="white" size="18px" />
                    </div>
                  </div>
                </q-td>
              </template>

              <!-- Pelapor -->
              <template #body-cell-pelapor="props">
                <q-td :props="props">
                  <div class="text-weight-bold text-grey-9">{{ props.row.reporter_name }}</div>
                  <div class="text-caption text-grey-6">{{ props.row.reporter_role || 'Citizen / Tourist' }}</div>
                </q-td>
              </template>

              <!-- Waktu Kirim -->
              <template #body-cell-timestamp="props">
                <q-td :props="props">
                  <span class="text-weight-medium text-grey-8">{{ formatDateTime(props.row.created_at) }}</span>
                </q-td>
              </template>

              <!-- Catatan Pelapor -->
              <template #body-cell-notes="props">
                <q-td :props="props">
                  <span v-if="props.row.user_notes" class="text-body2 text-grey-8 italic">
                    "{{ props.row.user_notes }}"
                  </span>
                  <span v-else class="text-caption text-grey-5">-</span>
                </q-td>
              </template>

              <!-- Aksi Zoom -->
              <template #body-cell-aksi="props">
                <q-td :props="props">
                  <q-btn
                    flat
                    round
                    dense
                    color="primary"
                    icon="zoom_in"
                    @click="openImageZoom(props.row.image_url, 'Clean Proof - ' + props.row.reporter_name)"
                  >
                    <q-tooltip>Enlarge Photo</q-tooltip>
                  </q-btn>
                </q-td>
              </template>
            </q-table>
          </div>
        </q-card>
      </div>

      <!-- Error Not Found -->
      <q-card v-else flat class="content-card q-pa-xl text-center">
        <q-icon name="error_outline" size="56px" color="negative" />
        <div class="text-h6 text-weight-bold text-grey-9 q-mt-md">Report Not Found</div>
        <div class="text-body2 text-grey-6 q-mt-xs">
          The dirty report with this ID was not found in the system.
        </div>
        <q-btn
          color="primary"
          label="Back to Monitoring"
          to="/admin/monitoring"
          no-caps
          unelevated
          class="q-mt-md"
          style="border-radius: 10px"
        />
      </q-card>
    </div>

    <!-- Dialog Modal Edit Status / Catatan Admin -->
    <q-dialog v-model="showEditModalState">
      <q-card style="width: 480px; max-width: 90vw" class="rounded-borders-lg bg-white overflow-hidden">
        <q-card-section class="row items-center justify-between bg-primary text-white q-py-sm">
          <div class="text-subtitle1 text-weight-bold">
            Edit Handling Status
          </div>
          <q-btn flat round dense icon="close" v-close-popup color="white" />
        </q-card-section>

        <q-card-section class="q-pa-lg" v-if="currentReport">
          <div class="text-subtitle2 text-grey-9 q-mb-xs">
            Location: <span class="text-weight-bold">{{ currentReport.location }}</span>
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
                placeholder="Example: Cleaning team has completed waste clearance at the location."
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
                :loading="isSubmittingStatus"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Dialog Modal Zoom Gambar -->
    <q-dialog v-model="showImageZoomModal">
      <q-card style="width: 720px; max-width: 95vw" class="rounded-borders-lg overflow-hidden bg-white">
        <q-card-section class="row items-center justify-between bg-grey-9 text-white q-py-sm">
          <div class="text-subtitle2 text-weight-bold ellipsis">{{ zoomedImageTitle || 'Photo Preview' }}</div>
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
import { useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { useCleanReportsStore } from 'src/stores/cleanReports'
import { api } from 'boot/axios'
import ProxyImage from 'components/ProxyImage.vue'
import report1Img from 'assets/report1.jpg'

const route = useRoute()
const $q = useQuasar()
const cleanStore = useCleanReportsStore()

const reportParamId = route.params.destinationId || route.params.reportId

const isLoading = ref(false)
const isSubmittingStatus = ref(false)
const currentReport = ref(null)
const destinationList = ref([])

const showEditModalState = ref(false)
const editForm = ref({ status: 'Pending', notes: '' })

const showImageZoomModal = ref(false)
const zoomedImageUrl = ref('')
const zoomedImageTitle = ref('')

const cleanColumns = [
  {
    name: 'index',
    label: 'No',
    field: 'id',
    align: 'center',
    style: 'width: 50px; font-weight: 600; color: #64748B;',
  },
  {
    name: 'foto',
    label: 'Clean Proof Photo',
    field: 'image_url',
    align: 'center',
  },
  {
    name: 'pelapor',
    label: 'Proof Submitter',
    field: 'reporter_name',
    align: 'left',
    sortable: true,
  },
  {
    name: 'timestamp',
    label: 'Submission Time',
    field: 'created_at',
    align: 'left',
    sortable: true,
  },
  {
    name: 'notes',
    label: 'User Notes',
    field: 'user_notes',
    align: 'left',
  },
  {
    name: 'aksi',
    label: 'Action',
    field: 'id',
    align: 'center',
  },
]

function openImageZoom(imgUrl, title) {
  zoomedImageUrl.value = imgUrl
  zoomedImageTitle.value = title || 'Photo Preview'
  showImageZoomModal.value = true
}

function openEditModal() {
  if (!currentReport.value) return
  editForm.value.status = currentReport.value.status
  editForm.value.notes = currentReport.value.notes || ''
  showEditModalState.value = true
}

const NGROK_HOST = 'https://coronary-moonstone-grain.ngrok-free.dev'

function formatReportImage(url) {
  if (!url || typeof url !== 'string') return report1Img
  let target = url.trim()
  if (!target) return report1Img

  if (target.startsWith('data:') || target.startsWith('blob:') || target.startsWith('/assets/')) {
    return target
  }
  if (target.startsWith('http://') && target.includes('ngrok')) {
    target = target.replace('http://', 'https://')
  }
  if (target.startsWith('/static/')) {
    target = `${NGROK_HOST}${target}`
  } else if (target.startsWith('/uploads/')) {
    target = `${NGROK_HOST}/static${target}`
  } else if (!target.startsWith('http://') && !target.startsWith('https://')) {
    target = `${NGROK_HOST}/static/${target.replace(/^\/+/, '')}`
  }
  if (target.includes('ngrok') && !target.includes('ngrok-skip-browser-warning')) {
    const sep = target.includes('?') ? '&' : '?'
    target = `${target}${sep}ngrok-skip-browser-warning=true`
  }
  return target
}

function formatStatus(st) {
  if (!st) return 'Pending'
  const s = String(st).toLowerCase()
  return (s === 'resolved' || s === 'handled') ? 'Resolved' : 'Pending'
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
  return name || '-'
}

function mapReport(item) {
  const score = item.score ?? item.ai_score ?? item.aiScore ?? 0
  const count = item.detected_count ?? item.detectedCount
  let analysis = item.ai_analysis || item.aiAnalysis || ''
  if (!analysis) {
    analysis = (count !== undefined && count !== null)
      ? (count > 0 ? `${count} waste object(s) detected` : 'No waste detected (Clean)')
      : (Number(score) >= 0.5 ? 'Dirty area detected' : 'Clean area')
  }

  return {
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

async function loadReportDetail() {
  isLoading.value = true

  // 1. Cek dari sessionStorage jika ada (instan)
  const cachedReport = sessionStorage.getItem(`monitoring_report_${reportParamId}`)
  if (cachedReport) {
    try {
      currentReport.value = JSON.parse(cachedReport)
    } catch {
      // ignore
    }
  }

  // 2. Fetch data segar dari backend
  try {
    await fetchDestinations()
    let res
    try {
      res = await api.get(`/reports/${reportParamId}`)
    } catch {
      try {
        res = await api.get(`/reports/${reportParamId}/`)
      } catch {
        res = await api.get('/reports')
      }
    }

    const data = res.data?.data || res.data
    if (Array.isArray(data)) {
      const found = data.find((r) => String(r.id) === String(reportParamId))
      if (found) {
        currentReport.value = mapReport(found)
      }
    } else if (data && typeof data === 'object') {
      currentReport.value = mapReport(data)
    }
  } catch (err) {
    console.error('Failed to load report detail:', err)
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  cleanStore.loadFromStorage()
  await Promise.all([
    cleanStore.fetchCleanReports(),
    loadReportDetail(),
  ])
})

// Daftar bukti bersih yang cocok untuk laporan kotor ini
const cleanProofsList = computed(() => {
  if (!currentReport.value) return []
  if (Array.isArray(currentReport.value.raw?.clean_reports) && currentReport.value.raw.clean_reports.length > 0) {
    return currentReport.value.raw.clean_reports.map((c) => ({
      id: c.id,
      report_id: c.report_id,
      destination_id: c.destination_id,
      destination_name: c.destination_name,
      reporter_name: c.user_name || c.reporter_name || 'Mobile User',
      reporter_role: c.reporter_role || 'Citizen / Tourist',
      image_url: formatReportImage(c.image_url),
      user_notes: c.notes || c.user_notes || '',
      created_at: c.created_at || '',
    }))
  }
  return cleanStore.getCleanReportsForDirtyReport(currentReport.value)
})

/**
 * Quick Approve laporan kotor menjadi Resolved
 */
async function quickApprove() {
  if (!currentReport.value) return
  isSubmittingStatus.value = true
  const reportId = currentReport.value.id
  const payload = {
    status: 'resolved',
    admin_notes: 'Report resolved directly by admin via monitoring detail',
    notes: 'Report resolved directly by admin via monitoring detail',
  }
  const reqConfig = { headers: { 'ngrok-skip-browser-warning': 'true' } }

  try {
    try {
      await api.put(`/reports/${reportId}`, payload, reqConfig)
    } catch {
      await api.put(`/reports/${reportId}/`, payload, reqConfig)
    }

    currentReport.value.status = 'Resolved'
    // Update juga di sessionStorage
    sessionStorage.setItem(`monitoring_report_${reportId}`, JSON.stringify(currentReport.value))

    $q.notify({
      type: 'positive',
      message: `Report #${reportId} (${currentReport.value.location}) successfully approved & Resolved!`,
      position: 'top',
    })
  } catch (err) {
    console.error('Failed to quick approve:', err)
    $q.notify({
      type: 'negative',
      message: 'Failed to update report status to backend.',
      position: 'top',
    })
  } finally {
    isSubmittingStatus.value = false
  }
}

/**
 * Simpan edit status & catatan admin
 */
async function saveStatus() {
  if (!currentReport.value) return
  isSubmittingStatus.value = true
  const reportId = currentReport.value.id
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

    currentReport.value.status = targetStatus
    currentReport.value.notes = targetNotes
    sessionStorage.setItem(`monitoring_report_${reportId}`, JSON.stringify(currentReport.value))
    showEditModalState.value = false

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

.content-card {
  border-radius: 16px;
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
}

.border-bottom {
  border-bottom: 1px solid #f1f5f9;
}

.detail-img-box {
  position: relative;
  width: 100%;
  max-width: 380px;
  height: 230px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  display: inline-block;
  background-color: #0f172a;

  .detail-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .detail-img-overlay {
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

  &:hover .detail-img-overlay {
    opacity: 1;
  }
}

.proof-table-img-box {
  position: relative;
  width: 72px;
  height: 52px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  display: inline-block;

  .proof-table-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .proof-table-img-overlay {
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

  &:hover .proof-table-img-overlay {
    opacity: 1;
  }
}

.custom-proof-table {
  :deep(thead tr th) {
    font-size: 0.82rem;
    font-weight: 700;
    color: #475569;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    background-color: #f8fafc;
    border-bottom: 2px solid #e2e8f0;
    padding: 12px 16px;
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

.italic {
  font-style: italic;
}

.rounded-borders-lg {
  border-radius: 16px;
}
</style>
