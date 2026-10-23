<template>
  <q-page class="page-container bg-grey-2">
    <div class="max-width-container">
      <div class="row items-center justify-between q-mb-md">
        <div class="col-12 col-md-auto q-mb-sm-res">
          <div class="row items-center q-gutter-x-sm">
            <div>
              <h1 class="text-weight-bold text-grey-9 q-ma-none font-header">
                Clean Reports
              </h1>
              <p class="text-grey-7 q-mt-xs q-mb-none font-subtitle">
                Cleanliness reports submitted by mobile users
              </p>
            </div>
          </div>
        </div>

        <div class="col-12 col-md-auto row items-center q-gutter-sm">
          <q-btn
            flat
            dense
            round
            icon="refresh"
            color="grey-8"
            :loading="cleanStore.isLoading"
            @click="refreshData"
          >
            <q-tooltip>Refresh Data</q-tooltip>
          </q-btn>
        </div>
      </div>

      <div class="row items-center justify-between q-col-gutter-sm q-mb-md">
        <div class="col-12 col-sm-7 col-md-5">
          <q-input
            v-model="searchQuery"
            placeholder="Search destination or reporter name..."
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

        <div class="col-12 col-sm-auto row justify-end">
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

      <q-card flat class="table-card">
        <q-table
          :rows="filteredReports"
          :columns="columns"
          row-key="id"
          flat
          :loading="cleanStore.isLoading || isSubmitting"
          class="custom-monitoring-table"
          :grid="$q.screen.xs"
          :pagination="{ rowsPerPage: 10 }"
        >
          <template #body-cell-foto="props">
            <q-td :props="props">
              <div class="table-img-wrapper cursor-pointer" @click="openImagePreview(props.row)">
                <ProxyImage :src="props.row.image_url" :alt="props.row.destination_name" class="table-img" />
              </div>
            </q-td>
          </template>

          <template #body-cell-reporter="props">
            <q-td :props="props">
              <div class="text-weight-bold text-grey-9">{{ props.row.reporter_name }}</div>
              <div class="text-caption text-grey-6">{{ props.row.reporter_role }}</div>
            </q-td>
          </template>

          <template #body-cell-timestamp="props">
            <q-td :props="props">
              <div class="text-grey-9">{{ formatDateTime(props.row.created_at) }}</div>
            </q-td>
          </template>

          <template #body-cell-status="props">
            <q-td :props="props">
              <div :class="['status-pill', getStatusClass(props.row.status)]">
                <q-icon :name="getStatusIcon(props.row.status)" size="14px" class="q-mr-xs" />
                <span>{{ getStatusLabel(props.row.status) }}</span>
              </div>
            </q-td>
          </template>

          <template #body-cell-aksi="props">
            <q-td :props="props">
              <div class="row items-center q-gutter-x-xs no-wrap justify-center">
                <q-btn
                  flat
                  round
                  dense
                  color="primary"
                  icon="zoom_in"
                  size="sm"
                  @click="openImagePreview(props.row)"
                >
                  <q-tooltip>View Details & Photo</q-tooltip>
                </q-btn>

                <template v-if="isPending(props.row.status)">
                  <q-btn
                    flat
                    round
                    dense
                    color="positive"
                    icon="check_circle"
                    size="sm"
                    @click="openVerifyDialog(props.row)"
                  >
                    <q-tooltip>Verify & Approve</q-tooltip>
                  </q-btn>
                  <q-btn
                    flat
                    round
                    dense
                    color="negative"
                    icon="cancel"
                    size="sm"
                    @click="openRejectDialog(props.row)"
                  >
                    <q-tooltip>Reject Report</q-tooltip>
                  </q-btn>
                  <q-btn
                    flat
                    dense
                    no-caps
                    color="secondary"
                    icon="assessment"
                    label="Inspect"
                    size="sm"
                    class="rounded-btn"
                    @click="goVerify(props.row)"
                  >
                    <q-tooltip>Inspect destination monitoring</q-tooltip>
                  </q-btn>
                </template>

                <template v-else-if="isVerified(props.row.status)">
                  <q-chip
                    dense
                    color="green-1"
                    text-color="positive"
                    class="text-weight-bold q-ma-none"
                  >
                    <q-icon name="check" size="12px" class="q-mr-xs" />
                    Verified
                  </q-chip>
                  <q-btn
                    flat
                    round
                    dense
                    color="grey-7"
                    icon="assessment"
                    size="sm"
                    @click="goVerify(props.row)"
                  >
                    <q-tooltip>View Destination Monitoring</q-tooltip>
                  </q-btn>
                </template>

                <template v-else-if="isRejected(props.row.status)">
                  <q-chip
                    dense
                    color="red-1"
                    text-color="negative"
                    class="text-weight-bold q-ma-none"
                  >
                    <q-icon name="close" size="12px" class="q-mr-xs" />
                    Rejected
                  </q-chip>
                </template>
              </div>
            </q-td>
          </template>

          <template #item="props">
            <div class="q-pa-xs col-xs-12">
              <q-card flat bordered class="q-pa-md bg-white rounded-borders-lg">
                <div class="row items-center justify-between q-mb-sm">
                  <div :class="['status-pill', getStatusClass(props.row.status)]">
                    <q-icon :name="getStatusIcon(props.row.status)" size="12px" class="q-mr-xs" />
                    {{ getStatusLabel(props.row.status) }}
                  </div>
                  <q-btn flat round dense color="primary" icon="zoom_in" size="sm" @click="openImagePreview(props.row)" />
                </div>
                <div class="row items-center q-gutter-x-sm q-mb-sm">
                  <div class="table-img-wrapper cursor-pointer" @click="openImagePreview(props.row)">
                    <ProxyImage :src="props.row.image_url" :alt="props.row.destination_name" class="table-img" />
                  </div>
                  <div class="column">
                    <span class="text-subtitle2 text-weight-bold text-grey-9">{{ props.row.destination_name }}</span>
                    <span class="text-caption text-grey-6">{{ props.row.reporter_name }}</span>
                    <span class="text-caption text-grey-6" style="font-size: 11px">{{ formatDateTime(props.row.created_at) }}</span>
                  </div>
                </div>
                <div class="text-caption text-grey-8 q-mb-sm notes-cell">
                  "{{ props.row.user_notes || 'Clean condition reported by user.' }}"
                </div>

                <div class="row q-gutter-xs full-width q-mt-xs" v-if="isPending(props.row.status)">
                  <q-btn
                    color="positive"
                    icon="check_circle"
                    label="Verify"
                    no-caps
                    dense
                    class="col rounded-borders-btn text-weight-bold"
                    @click="openVerifyDialog(props.row)"
                  />
                  <q-btn
                    outline
                    color="negative"
                    icon="cancel"
                    label="Reject"
                    no-caps
                    dense
                    class="col rounded-borders-btn text-weight-bold"
                    @click="openRejectDialog(props.row)"
                  />
                  <q-btn
                    flat
                    color="secondary"
                    icon="assessment"
                    label="Inspect"
                    no-caps
                    dense
                    class="col-auto rounded-borders-btn"
                    @click="goVerify(props.row)"
                  />
                </div>
              </q-card>
            </div>
          </template>

          <template #no-data>
            <div class="full-width column flex-center q-py-xl">
              <q-icon name="check_circle_outline" size="56px" color="grey-5" class="q-mb-sm" />
              <div class="text-h6 text-grey-8 text-weight-bold">No reports found</div>
              <p class="text-body2 text-grey-6 q-mt-xs">
                No clean reports match the selected filters.
              </p>
              <q-btn color="primary" outline no-caps label="Reset Filter" @click="resetFilter" />
            </div>
          </template>
        </q-table>
      </q-card>
    </div>

    <q-dialog v-model="showImageModal">
      <q-card style="width: 680px; max-width: 92vw" class="rounded-borders-lg overflow-hidden bg-white">
        <q-card-section class="row items-center justify-between bg-primary text-white q-px-lg q-py-md">
          <div class="text-subtitle1 text-weight-bold">
            Cleanliness Proof Photo - {{ activeReport?.destination_name }}
          </div>
          <q-btn flat round dense icon="close" v-close-popup color="white" />
        </q-card-section>

        <q-card-section class="q-pa-lg scroll" style="max-height: 68vh;" v-if="activeReport">
          <div class="modal-img-container q-mb-md">
            <ProxyImage
              :src="activeReport.image_url"
              :alt="activeReport.destination_name"
              class="modal-img-blur"
            />
            <ProxyImage
              :src="activeReport.image_url"
              :alt="activeReport.destination_name"
              class="modal-img"
            />
          </div>

          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-12 col-sm-6">
              <div class="text-caption text-grey-7">Destination Location</div>
              <div class="text-subtitle2 text-weight-bold text-grey-9">
                {{ activeReport.destination_name }}
              </div>
            </div>
            <div class="col-12 col-sm-6">
              <div class="text-caption text-grey-7">Report Time</div>
              <div class="text-subtitle2 text-weight-bold text-grey-9">
                {{ formatDateTime(activeReport.created_at) }}
              </div>
            </div>
            <div class="col-12 col-sm-6">
              <div class="text-caption text-grey-7">Reporter</div>
              <div class="text-subtitle2 text-weight-bold text-grey-9">
                {{ activeReport.reporter_name }}
                <span class="text-caption text-grey-6 font-weight-regular">({{ activeReport.reporter_role }})</span>
              </div>
            </div>
            <div class="col-12 col-sm-6">
              <div class="text-caption text-grey-7">Report Status</div>
              <div class="q-mt-xs">
                <div :class="['status-pill', getStatusClass(activeReport.status)]">
                  <q-icon :name="getStatusIcon(activeReport.status)" size="14px" class="q-mr-xs" />
                  <span>{{ getStatusLabel(activeReport.status) }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="q-mt-xs q-mb-md">
            <div class="text-caption text-grey-7 q-mb-xs">Cleanliness Notes from Reporter:</div>
            <div class="text-body2 text-grey-8 bg-grey-1 q-pa-md rounded-borders" style="border: 1px solid #e2e8f0; line-height: 1.6;">
              "{{ activeReport.user_notes || 'No notes provided' }}"
            </div>
          </div>

          <div v-if="activeReport.admin_notes" class="q-mt-xs">
            <div class="text-caption text-grey-7 q-mb-xs">Admin Notes:</div>
            <div class="text-body2 text-grey-9 bg-blue-1 q-pa-md rounded-borders" style="border: 1px solid #bfdbfe; line-height: 1.6;">
              {{ activeReport.admin_notes }}
            </div>
          </div>
        </q-card-section>

        <q-separator />
        <q-card-actions align="right" class="q-px-lg q-py-md bg-grey-1">
          <q-btn flat no-caps label="Close" color="grey-8" v-close-popup class="q-px-md" />

          <template v-if="activeReport && isPending(activeReport.status)">
            <q-btn
              outline
              color="negative"
              icon="cancel"
              label="Reject"
              no-caps
              class="rounded-borders-btn text-weight-bold q-px-md"
              @click="openRejectDialog(activeReport); showImageModal = false"
            />
            <q-btn
              color="positive"
              icon="check_circle"
              label="Verify & Approve"
              no-caps
              class="rounded-borders-btn text-weight-bold q-px-md"
              @click="openVerifyDialog(activeReport); showImageModal = false"
            />
          </template>

          <q-btn
            v-if="activeReport?.destination_id"
            flat
            color="secondary"
            icon="assessment"
            label="Inspect Monitoring"
            no-caps
            class="rounded-borders-btn q-px-md"
            @click="goVerify(activeReport); showImageModal = false"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showVerifyModal" persistent>
      <q-card style="width: 480px; max-width: 92vw" class="rounded-borders-lg bg-white q-pa-md">
        <q-card-section class="row items-center q-pb-none">
          <q-avatar icon="check_circle" color="green-1" text-color="positive" size="44px" />
          <div class="text-h6 text-weight-bold q-ml-sm text-grey-9">Verify Cleanliness</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup color="grey-7" />
        </q-card-section>

        <q-card-section class="q-pt-md">
          <p class="text-body2 text-grey-7 q-mb-md">
            Konfirmasi bahwa destinasi <strong>{{ actionTargetReport?.destination_name }}</strong> sudah bersih berdasarkan bukti laporan dari <strong>{{ actionTargetReport?.reporter_name }}</strong>.
          </p>
          <q-input
            v-model="adminNotesInput"
            label="Admin Notes (Opsional)"
            placeholder="Area telah dikonfirmasi bersih oleh admin."
            outlined
            dense
            type="textarea"
            rows="3"
          />
        </q-card-section>

        <q-card-actions align="right" class="q-pt-none">
          <q-btn flat label="Batal" color="grey-7" no-caps v-close-popup :disable="isSubmitting" />
          <q-btn
            unelevated
            label="Verifikasi Sekarang"
            color="positive"
            no-caps
            class="rounded-borders-btn text-weight-bold q-px-md"
            :loading="isSubmitting"
            @click="confirmVerify"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showRejectModal" persistent>
      <q-card style="width: 480px; max-width: 92vw" class="rounded-borders-lg bg-white q-pa-md">
        <q-card-section class="row items-center q-pb-none">
          <q-avatar icon="cancel" color="red-1" text-color="negative" size="44px" />
          <div class="text-h6 text-weight-bold q-ml-sm text-grey-9">Reject Clean Report</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup color="grey-7" />
        </q-card-section>

        <q-card-section class="q-pt-md">
          <p class="text-body2 text-grey-7 q-mb-md">
            Apakah Anda yakin ingin menolak laporan kebersihan untuk <strong>{{ actionTargetReport?.destination_name }}</strong>? Pelapor akan mendapatkan notifikasi penolakan.
          </p>
          <q-input
            v-model="adminNotesInput"
            label="Alasan Penolakan (Admin Notes)"
            placeholder="Foto tidak jelas atau kondisi belum sepenuhnya bersih."
            outlined
            dense
            type="textarea"
            rows="3"
          />
        </q-card-section>

        <q-card-actions align="right" class="q-pt-none">
          <q-btn flat label="Batal" color="grey-7" no-caps v-close-popup :disable="isSubmitting" />
          <q-btn
            unelevated
            label="Tolak Laporan"
            color="negative"
            no-caps
            class="rounded-borders-btn text-weight-bold q-px-md"
            :loading="isSubmitting"
            @click="confirmReject"
          />
        </q-card-actions>
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
import { useRouter } from 'vue-router'
import { useCleanReportsStore } from 'src/stores/cleanReports'
import { api } from 'boot/axios'
import ProxyImage from 'components/ProxyImage.vue'
import StatusDialog from 'components/StatusDialog.vue'

const router = useRouter()
const cleanStore = useCleanReportsStore()

const searchQuery = ref('')
const statusFilter = ref('all')

const statusOptions = [
  { label: 'All Statuses', value: 'all' },
  { label: 'Pending Verification', value: 'pending' },
  { label: 'Verified', value: 'verified' },
  { label: 'Rejected', value: 'rejected' },
]

const showImageModal = ref(false)
const activeReport = ref(null)

const showVerifyModal = ref(false)
const showRejectModal = ref(false)
const actionTargetReport = ref(null)
const adminNotesInput = ref('')
const isSubmitting = ref(false)

const showStatusFeedback = ref(false)
const feedbackConfig = ref({
  type: 'success',
  title: '',
  message: '',
})

const columns = [
  {
    name: 'destination',
    label: 'Destination',
    field: 'destination_name',
    align: 'left',
    sortable: true,
    style: 'font-weight: 700; color: #1E293B;',
  },
  {
    name: 'foto',
    label: 'Clean Proof Photo',
    field: 'image_url',
    align: 'center',
  },
  {
    name: 'reporter',
    label: 'Reporter',
    field: 'reporter_name',
    align: 'left',
  },
  {
    name: 'timestamp',
    label: 'Report Time',
    field: 'created_at',
    align: 'left',
    sortable: true,
  },
  {
    name: 'status',
    label: 'Verification Status',
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

onMounted(async () => {
  cleanStore.loadFromStorage()
  await cleanStore.fetchCleanReports()
})

async function refreshData() {
  await cleanStore.fetchCleanReports()
}

function isPending(status) {
  const s = String(status || '').toLowerCase()
  return s === 'pending' || !s
}

function isVerified(status) {
  const s = String(status || '').toLowerCase()
  return s === 'verified' || s === 'resolved'
}

function isRejected(status) {
  const s = String(status || '').toLowerCase()
  return s === 'rejected'
}

function getStatusClass(status) {
  if (isVerified(status)) return 'status-verified'
  if (isRejected(status)) return 'status-rejected'
  return 'status-pending'
}

function getStatusIcon(status) {
  if (isVerified(status)) return 'check_circle'
  if (isRejected(status)) return 'cancel'
  return 'pending_actions'
}

function getStatusLabel(status) {
  if (isVerified(status)) return 'Verified'
  if (isRejected(status)) return 'Rejected'
  return 'Pending Verification'
}

const filteredReports = computed(() => {
  return cleanStore.cleanReports.filter((item) => {
    const q = searchQuery.value.trim().toLowerCase()
    const matchesSearch =
      !q ||
      (item.destination_name || '').toLowerCase().includes(q) ||
      (item.user_notes || '').toLowerCase().includes(q) ||
      (item.reporter_name || '').toLowerCase().includes(q)

    let matchesStatus = true
    if (statusFilter.value === 'pending') {
      matchesStatus = isPending(item.status)
    } else if (statusFilter.value === 'verified') {
      matchesStatus = isVerified(item.status)
    } else if (statusFilter.value === 'rejected') {
      matchesStatus = isRejected(item.status)
    }

    return matchesSearch && matchesStatus
  })
})

function resetFilter() {
  searchQuery.value = ''
  statusFilter.value = 'all'
}

function openImagePreview(report) {
  activeReport.value = report
  showImageModal.value = true
}

function openVerifyDialog(report) {
  actionTargetReport.value = report
  adminNotesInput.value = 'Verified clean by government admin.'
  showVerifyModal.value = true
}

function openRejectDialog(report) {
  actionTargetReport.value = report
  adminNotesInput.value = ''
  showRejectModal.value = true
}

async function confirmVerify() {
  if (!actionTargetReport.value) return
  isSubmitting.value = true
  try {
    await cleanStore.verifyCleanReport(
      actionTargetReport.value.id,
      adminNotesInput.value.trim() || 'Verified clean by government admin.',
    )
    showVerifyModal.value = false
    feedbackConfig.value = {
      type: 'success',
      title: 'Laporan Diverifikasi',
      message: `Laporan kebersihan destinasi "${actionTargetReport.value.destination_name}" telah diverifikasi.`,
    }
    showStatusFeedback.value = true
  } catch (e) {
    console.error('Failed to verify clean report:', e)
    feedbackConfig.value = {
      type: 'error',
      title: 'Gagal Memverifikasi',
      message: e.response?.data?.message || 'Terjadi kesalahan saat memverifikasi laporan.',
    }
    showStatusFeedback.value = true
  } finally {
    isSubmitting.value = false
  }
}

async function confirmReject() {
  if (!actionTargetReport.value) return
  isSubmitting.value = true
  try {
    await cleanStore.rejectCleanReport(
      actionTargetReport.value.id,
      adminNotesInput.value.trim() || 'Laporan kebersihan ditolak.',
    )
    showRejectModal.value = false
    feedbackConfig.value = {
      type: 'info',
      title: 'Laporan Ditolak',
      message: `Laporan kebersihan destinasi "${actionTargetReport.value.destination_name}" telah ditolak.`,
    }
    showStatusFeedback.value = true
  } catch (e) {
    console.error('Failed to reject clean report:', e)
    feedbackConfig.value = {
      type: 'error',
      title: 'Gagal Menolak Laporan',
      message: e.response?.data?.message || 'Terjadi kesalahan saat menolak laporan.',
    }
    showStatusFeedback.value = true
  } finally {
    isSubmitting.value = false
  }
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

async function goVerify(report) {
  const destId = report.destination_id

  if (!destId) {
    router.push('/admin/monitoring')
    return
  }

  try {
    let dirtyRes
    try { dirtyRes = await api.get('/reports') } catch { dirtyRes = await api.get('/reports/') }
    const rawDirty = dirtyRes.data?.data || dirtyRes.data || []
    const allDirty = (Array.isArray(rawDirty) ? rawDirty : []).filter((r) => {
      return String(r.destination_id || '') === String(destId)
    })

    let baselineDate = null
    let baselineLabel = null

    try {
      let cleanRes
      try {
        cleanRes = await api.get(`/clean-reports?status=verified`)
      } catch {
        cleanRes = await api.get(`/clean-reports/`)
      }
      const rawClean = cleanRes.data?.data || cleanRes.data || []
      const verifiedCleans = (Array.isArray(rawClean) ? rawClean : [])
        .filter((c) => {
          return (
            String(c.destination_id || '') === String(destId) &&
            (c.status === 'verified' || c.status === 'resolved') &&
            c.verified_at
          )
        })
        .sort((a, b) => new Date(b.verified_at) - new Date(a.verified_at))

      if (verifiedCleans.length > 0) {
        baselineDate = new Date(verifiedCleans[0].verified_at)
        baselineLabel = formatDateTime(verifiedCleans[0].verified_at)
      }
    } catch (e) {
      console.warn('Could not fetch clean reports for baseline:', e)
    }

    const filteredDirty = baselineDate
      ? allDirty.filter((r) => {
          const reportDate = new Date(r.created_at || r.timestamp || 0)
          return reportDate > baselineDate
        })
      : allDirty

    sessionStorage.setItem(
      `monitoring_dest_${destId}`,
      JSON.stringify({
        location: report.destination_name,
        destinationId: destId,
        baselineVerifiedAt: baselineDate ? baselineDate.toISOString() : null,
        baselineLabel: baselineLabel,
        totalDirtyAll: allDirty.length,
        totalDirtyFiltered: filteredDirty.length,
        reports: filteredDirty.map((r) => ({
          id: r.id,
          destination_id: r.destination_id,
          location: report.destination_name,
          image: r.image_url || r.image || '',
          aiScore: r.score ?? r.ai_score ?? 0,
          aiAnalysis: r.ai_analysis || '',
          timestamp: formatDateTime(r.created_at || ''),
          status:
            String(r.status || '').toLowerCase() === 'resolved' ||
            String(r.status || '').toLowerCase() === 'handled'
              ? 'Resolved'
              : 'Pending',
          reporterNotes: r.user_notes || r.reporter_notes || '',
          notes: r.admin_notes || r.notes || '',
          raw: r,
        })),
      }),
    )

    router.push(`/admin/monitoring/${destId}`)
  } catch (e) {
    console.warn('Could not preload destination reports:', e)
    router.push(`/admin/monitoring/${destId}`)
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
  width: 100%;
  max-width: 420px;
}

.filter-select {
  width: 100%;
  min-width: 200px;
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

.notes-cell {
  max-width: 280px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-style: italic;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.3px;
}

.status-pending { background-color: #fef3c7; color: #b45309; }
.status-verified { background-color: #dcfce7; color: #15803d; }
.status-rejected { background-color: #fee2e2; color: #b91c1c; }

.rounded-btn { border-radius: 8px; }
.rounded-borders-btn { border-radius: 10px; }
.rounded-borders-lg { border-radius: 16px; }

.modal-img-container {
  position: relative;
  width: 100%;
  height: 280px;
  border-radius: 12px;
  overflow: hidden;
  background-color: #000;
}

.modal-img-blur {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: blur(20px);
  opacity: 0.4;
  transform: scale(1.1);
}

.modal-img {
  position: relative;
  width: 100%;
  height: 100%;
  object-fit: contain;
  z-index: 1;
}
</style>
