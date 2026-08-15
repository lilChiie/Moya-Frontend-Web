<template>
  <q-page class="q-py-xl q-px-lg bg-grey-2">
    <div class="max-width-container">
      <div class="row items-center justify-between q-mb-sm">
        <div>
          <h1 class="text-h4 text-weight-bold text-grey-9 q-ma-none font-header">
            Cleanliness Report Monitoring
          </h1>
          <p class="text-subtitle1 text-grey-7 q-mt-xs q-mb-none font-subtitle">
            Manage and monitor cleanliness status for Batam tourism destinations
          </p>
        </div>
      </div>
      <div class="row items-center flex justify-between q-mb-md">
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

      <q-card flat class="table-card q-pa-sm">
        <q-table
          :rows="filteredReports"
          :columns="columns"
          row-key="id"
          flat
          class="custom-monitoring-table"
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

        <q-card-section class="q-pa-lg" v-if="selectedReport">
          <div class="modal-img-container q-mb-md">
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
              <div class="text-body2 text-grey-8 bg-blue-1 q-pa-sm rounded-borders text-italic" style="border: 1px solid #bfdbfe">
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
import { ref, computed } from 'vue'
import StatusDialog from 'components/StatusDialog.vue'

import report1Img from 'assets/report1.jpg'
import report2Img from 'assets/report2.jpg'

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

const reports = ref([
  {
    id: 1,
    location: 'Welcome to Batam',
    image: report1Img,
    aiScore: '0.5',
    aiAnalysis: 'Plastic & Packaging Waste Accumulation',
    timestamp: '2/8/2026, 17:37:50',
    status: 'Pending',
    reporterNotes: 'Plastic and food packaging waste accumulated near the main landmark entrance after afternoon tourist crowd.',
    notes: '',
  },
  {
    id: 2,
    location: 'Pantai Melayu',
    image: report1Img,
    aiScore: '0.5',
    aiAnalysis: 'Organic & Plastic Waste in Coastal Area',
    timestamp: '2/8/2026, 15:07:02',
    status: 'Pending',
    reporterNotes: 'Organic waste and plastic bottles left along the beach shoreline area.',
    notes: '',
  },
  {
    id: 3,
    location: 'Pantai Batu Hoda',
    image: report1Img,
    aiScore: '0.5',
    aiAnalysis: 'Accumulation of Visitor Waste',
    timestamp: '2/8/2026, 15:03:53',
    status: 'Pending',
    reporterNotes: 'Visitor trash bins overflowing near the gazebo relaxation area.',
    notes: '',
  },
  {
    id: 4,
    location: 'Jembatan Barelang',
    image: report2Img,
    aiScore: '0.1',
    aiAnalysis: 'Clean & Well-Maintained Area',
    timestamp: '2/8/2026, 14:52:03',
    status: 'Resolved',
    reporterNotes: 'Cleanliness check around bridge viewpoint area.',
    notes: 'Routine cleaning completed by local maintenance team.',
  },
  {
    id: 5,
    location: 'Pantai Nongsa',
    image: report2Img,
    aiScore: '0.1',
    aiAnalysis: 'Clean Coastal Beach Area',
    timestamp: '2/8/2026, 11:20:15',
    status: 'Resolved',
    reporterNotes: 'Morning beach cleanliness patrol inspection.',
    notes: 'Area verified clean and clear of waste.',
  },
])

const filteredReports = computed(() => {
  return reports.value.filter((item) => {
    const matchSearch =
      item.location.toLowerCase().includes(filterSearch.value.toLowerCase()) ||
      item.aiAnalysis.toLowerCase().includes(filterSearch.value.toLowerCase())
    const matchStatus = filterStatus.value === 'All' || item.status === filterStatus.value

    return matchSearch && matchStatus
  })
})

const openDetailModal = (report) => {
  selectedReport.value = report
  showDetailModal.value = true
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

const saveStatus = () => {
  if (editingReport.value) {
    const index = reports.value.findIndex((r) => r.id === editingReport.value.id)
    if (index !== -1) {
      reports.value[index].status = editForm.value.status
      reports.value[index].notes = editForm.value.notes
    }
  }

  const reportLoc = editingReport.value?.location || 'The report'
  showEditModal.value = false

  feedbackConfig.value = {
    type: 'success',
    title: 'Report Status Updated',
    message: `Status for "${reportLoc}" has been successfully updated to "${editForm.value.status}".`,
  }
  showStatusFeedback.value = true
}
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

:deep(.q-field__control) {
  border-radius: 12px !important;
}

.search-input {
  width: 380px;
}

.filter-select {
  min-width: 170px;
}

.table-card {
  border-radius: 16px;
  background-color: #ffffff;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  border: 1px solid #e2e8f0;
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
  max-height: 280px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
}

.modal-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
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
