<template>
  <q-page class="q-py-xl q-px-lg bg-grey-2">
    <div class="max-width-container">
      <div class="row items-center justify-between q-mb-lg">
        <div>
          <h1 class="text-h4 text-weight-bold text-grey-9 q-ma-none font-header">
            Monitoring Laporan Kebersihan
          </h1>
          <p class="text-subtitle1 text-grey-7 q-mt-xs q-mb-none font-subtitle">
            Kelola dan pantau status penanganan kebersihan pariwisata Batam
          </p>
        </div>
        
        <div class="row items-center q-gutter-x-sm">
          <q-input
            v-model="filterSearch"
            placeholder="Cari lokasi..."
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
            style="min-width: 170px;"
            emit-value
            map-options
          >
            <template #prepend>
              <q-icon name="filter_list" color="grey-6" />
            </template>
          </q-select>
        </div>
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
                  :class="props.row.aiScore >= 0.5 ? 'bg-red-1 text-negative' : 'bg-green-1 text-positive'"
                  class="text-weight-bold font-chip q-mb-xs style-fit-content" size="sm"
                >
                  Skor AI: {{ props.row.aiScore }}
                </q-chip>
                <span class="text-caption text-grey-8 text-weight-medium">
                  {{ props.row.aiAnalysis }}
                </span>
              </div>
            </q-td>
          </template>

          <template #body-cell-status="props">
            <q-td :props="props">
              <q-chip
                dense
                size="md"
                :color="props.row.status === 'Sudah Ditangani' ? 'positive' : 'warning'"
                text-color="white"
                class="text-weight-bold q-pa-md"
                :icon="props.row.status === 'Sudah Ditangani' ? 'check_circle' : 'hourglass_top'"
              >
                {{ props.row.status }}
              </q-chip>
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
                  <q-tooltip>Lihat Detail Laporan</q-tooltip>
                </q-btn>

                <q-btn
                  flat
                  round
                  dense
                  color="orange-9"
                  icon="edit"
                  @click="openEditModal(props.row)"
                >
                  <q-tooltip>Edit Status Penanganan</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </template>
        </q-table>
      </q-card>
    </div>

    <q-dialog v-model="showDetailModal">
      <q-card style="width: 600px; max-width: 90vw;" class="rounded-borders-lg">
        <q-card-section class="row items-center justify-between bg-primary text-white q-py-sm">
          <div class="text-subtitle1 text-weight-bold">
            Detail Laporan - {{ selectedReport?.location }}
          </div>
          <q-btn flat round dense icon="close" v-close-popup color="white" />
        </q-card-section>

        <q-card-section class="q-pa-md" v-if="selectedReport">
          <div class="modal-img-container q-mb-md">
            <img :src="selectedReport.image" :alt="selectedReport.location" class="modal-img" />
          </div>

          <div class="row q-col-gutter-md">
            <div class="col-12 col-sm-6">
              <div class="text-caption text-grey-7">Lokasi Destinasi</div>
              <div class="text-subtitle2 text-weight-bold text-grey-9">
                {{ selectedReport.location }}
              </div>
            </div>

            <div class="col-12 col-sm-6">
              <div class="text-caption text-grey-7">Waktu Laporan</div>
              <div class="text-subtitle2 text-weight-bold text-grey-9">
                {{ selectedReport.timestamp }}
              </div>
            </div>

            <div class="col-12 col-sm-6">
              <div class="text-caption text-grey-7">Hasil Analisis AI</div>
              <div class="text-subtitle2 text-weight-bold text-primary">
                {{ selectedReport.aiAnalysis }} (Skor: {{ selectedReport.aiScore }})
              </div>
            </div>

            <div class="col-12 col-sm-6">
              <div class="text-caption text-grey-7">Status Penanganan</div>
              <div>
                <q-chip
                  dense
                  :color="selectedReport.status === 'Sudah Ditangani' ? 'positive' : 'warning'"
                  text-color="white"
                  class="text-weight-bold q-px-sm q-mt-xs"
                >
                  {{ selectedReport.status }}
                </q-chip>
              </div>
            </div>

            <div class="col-12" v-if="selectedReport.notes">
              <div class="text-caption text-grey-7">Catatan Pengelola</div>
              <div class="text-body2 text-grey-8 bg-grey-2 q-pa-sm rounded-borders">
                {{ selectedReport.notes }}
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md bg-grey-1">
          <q-btn flat label="Tutup" color="grey-8" v-close-popup />
          <q-btn
            color="primary"
            label="Ubah Status"
            icon="edit"
            @click="switchFromDetailToEdit"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showEditModal">
      <q-card style="width: 480px; max-width: 90vw;" class="rounded-borders-lg">
        <q-card-section class="row items-center justify-between bg-primary text-white q-py-sm">
          <div class="text-subtitle1 text-weight-bold">
            Ubah Status Penanganan
          </div>
          <q-btn flat round dense icon="close" v-close-popup color="white" />
        </q-card-section>

        <q-card-section class="q-pa-md" v-if="editingReport">
          <div class="text-subtitle2 text-grey-9 q-mb-xs">
            Lokasi: <span class="text-weight-bold">{{ editingReport.location }}</span>
          </div>
          <div class="text-caption text-grey-6 q-mb-md">
            Ubah status laporan menjadi "Sudah Ditangani" jika petugas telah menyelesaikan pembersihan.
          </div>

          <q-form @submit.prevent="saveStatus">
            <div class="q-mb-md">
              <div class="text-caption text-weight-bold text-grey-8 q-mb-xs">Status Laporan</div>
              <q-select
                v-model="editForm.status"
                :options="['Belum Ditangani', 'Sudah Ditangani']"
                outlined
                dense
                emit-value
                map-options
              />
            </div>

            <div class="q-mb-md">
              <div class="text-caption text-weight-bold text-grey-8 q-mb-xs">Catatan Pengelola (Opsional)</div>
              <q-input
                v-model="editForm.notes"
                type="textarea"
                outlined
                rows="3"
                placeholder="Contoh: Petugas kebersihan telah mengangkut sampah di lokasi pukul 16:00 WIB."
                dense
              />
            </div>

            <div class="row justify-end q-gutter-x-sm q-mt-md">
              <q-btn flat label="Batal" color="grey-8" v-close-popup />
              <q-btn type="submit" color="primary" label="Simpan Perubahan" icon="save" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'

import report1Img from 'assets/report1.jpg'
import report2Img from 'assets/report2.jpg'

const filterSearch = ref('')
const filterStatus = ref('Semua')
const statusOptions = [
  { label: 'Semua Status', value: 'Semua' },
  { label: 'Belum Ditangani', value: 'Belum Ditangani' },
  { label: 'Sudah Ditangani', value: 'Sudah Ditangani' },
]

const showDetailModal = ref(false)
const selectedReport = ref(null)

const showEditModal = ref(false)
const editingReport = ref(null)
const editForm = ref({
  status: 'Sudah Ditangani',
  notes: '',
})

const columns = [
  {
    name: 'location',
    label: 'Lokasi',
    field: 'location',
    align: 'left',
    sortable: true,
    style: 'font-weight: 700; color: #1E293B;',
  },
  {
    name: 'foto',
    label: 'Foto Lokasi',
    field: 'image',
    align: 'center',
  },
  {
    name: 'analisis',
    label: 'Analisis AI',
    field: 'aiAnalysis',
    align: 'left',
  },
  {
    name: 'timestamp',
    label: 'Waktu Laporan',
    field: 'timestamp',
    align: 'left',
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
    label: 'Aksi Pengelola',
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
    aiAnalysis: 'Tumpukan Sampah Plastik & Kemasan',
    timestamp: '2/8/2026, 17:37:50',
    status: 'Belum Ditangani',
    notes: '',
  },
  {
    id: 2,
    location: 'Pantai Melayu',
    image: report1Img,
    aiScore: '0.5',
    aiAnalysis: 'Sampah Organik & Plastik di Area Pesisir',
    timestamp: '2/8/2026, 15:07:02',
    status: 'Belum Ditangani',
    notes: '',
  },
  {
    id: 3,
    location: 'Pantai Batu Hoda',
    image: report1Img,
    aiScore: '0.5',
    aiAnalysis: 'Penumpukan Sampah Pengunjung',
    timestamp: '2/8/2026, 15:03:53',
    status: 'Belum Ditangani',
    notes: '',
  },
  {
    id: 4,
    location: 'Jembatan Barelang',
    image: report2Img,
    aiScore: '0.1',
    aiAnalysis: 'Kawasan Bersih & Terawat',
    timestamp: '2/8/2026, 14:52:03',
    status: 'Sudah Ditangani',
    notes: 'Pembersihan rutin telah dilakukan oleh tim kebersihan daerah.',
  },
  {
    id: 5,
    location: 'Pantai Nongsa',
    image: report2Img,
    aiScore: '0.1',
    aiAnalysis: 'Area Pantai Bersih Terjaga',
    timestamp: '2/8/2026, 11:20:15',
    status: 'Sudah Ditangani',
    notes: 'Kawasan dipastikan bebas sampah.',
  },
])

const filteredReports = computed(() => {
  return reports.value.filter((item) => {
    const matchSearch =
      item.location.toLowerCase().includes(filterSearch.value.toLowerCase()) ||
      item.aiAnalysis.toLowerCase().includes(filterSearch.value.toLowerCase())
    const matchStatus =
      filterStatus.value === 'Semua' || item.status === filterStatus.value

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
  showEditModal.value = false
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

.search-input {
  width: 240px;

  :deep(.q-field__control) {
    border-radius: 12px !important;
  }
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