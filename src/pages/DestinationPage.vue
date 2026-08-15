<template>
  <q-page class="q-py-xl q-px-lg bg-grey-2">
    <div class="max-width-container">
      <div class="row items-center justify-between q-mb-sm">
        <div>
          <h1 class="text-h4 text-weight-bold text-grey-9 q-ma-none font-header">
            Destination List & Management
          </h1>
          <p class="text-subtitle1 text-grey-7 q-mt-xs q-mb-none font-subtitle">
            View, search, manage, and add mapped tourism destinations
          </p>
        </div>

        <div class="row items-center justify-between full-width q-my-md">
          <q-input
            v-model="filterSearch"
            placeholder="Search destination name or category..."
            dense
            outlined
            bg-color="white"
            class="search-input"
          >
            <template #prepend>
              <q-icon name="search" color="grey-6" />
            </template>
          </q-input>

          <q-btn
            color="primary"
            icon="add"
            label="Add New Destination"
            no-caps
            style="border-radius: 12px"
            class="text-weight-bold"
            to="/admin/destination/add"
          />
        </div>
      </div>

      <q-card flat class="table-card q-pa-sm">
        <q-table
          :rows="filteredDestinations"
          :columns="columns"
          row-key="id"
          flat
          class="custom-dest-table"
          :pagination="{ rowsPerPage: 10 }"
        >
          <template #body-cell-index="props">
            <q-td :props="props">
              {{ props.rowIndex + 1 }}
            </q-td>
          </template>

          <template #body-cell-name="props">
            <q-td :props="props" class="text-weight-bold text-grey-9">
              {{ props.row.name }}
            </q-td>
          </template>

          <template #body-cell-photo="props">
            <q-td :props="props">
              <div
                class="table-img-wrapper cursor-pointer"
                @click="openDetailModal(props.row)"
              >
                <img :src="props.row.image" :alt="props.row.name" class="table-img" />
              </div>
            </q-td>
          </template>

          <template #body-cell-category="props">
            <q-td :props="props">
              <div class="row q-gutter-xs">
                <q-chip
                  v-for="(cat, i) in props.row.categories"
                  :key="i"
                  dense
                  class="bg-blue-1 text-primary text-weight-bold font-chip"
                >
                  {{ cat }}
                </q-chip>
              </div>
            </q-td>
          </template>

          <template #body-cell-accessibility="props">
            <q-td :props="props">
              <q-chip dense outline color="teal" class="text-weight-bold font-chip">
                {{ props.row.accessibility }}
              </q-chip>
            </q-td>
          </template>

          <template #body-cell-ticketPrice="props">
            <q-td :props="props" class="text-weight-bold">
              <span v-if="props.row.ticketPrice > 0" class="text-primary">
                Rp {{ Number(props.row.ticketPrice).toLocaleString('id-ID') }}
              </span>
              <span v-else class="text-positive text-weight-bolder">
                Gratis
              </span>
            </q-td>
          </template>

          <template #body-cell-coords="props">
            <q-td :props="props" class="text-grey-7" style="font-family: monospace; font-size: 12px">
              {{ props.row.latitude }}, {{ props.row.longitude }}
            </q-td>
          </template>

          <template #body-cell-actions="props">
            <q-td :props="props">
              <div class="row items-center justify-center q-gutter-x-xs">
                <q-btn
                  flat
                  round
                  dense
                  color="primary"
                  icon="visibility"
                  @click="openDetailModal(props.row)"
                >
                  <q-tooltip>View Destination Detail</q-tooltip>
                </q-btn>

                <q-btn
                  flat
                  round
                  dense
                  color="primary"
                  icon="edit"
                  @click="openEditModal(props.row)"
                >
                  <q-tooltip>Edit Destination</q-tooltip>
                </q-btn>

                <q-btn
                  flat
                  round
                  dense
                  color="negative"
                  icon="delete"
                  @click="openDeleteModal(props.row)"
                >
                  <q-tooltip>Delete Destination</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </template>
        </q-table>
      </q-card>
    </div>

    <q-dialog v-model="showDetailModal">
      <q-card style="width: 540px; max-width: 90vw" class="rounded-borders-lg q-pb-md" v-if="selectedDest">
        <q-card-section class="row items-center justify-between bg-primary text-white q-py-sm">
          <div class="text-subtitle1 text-weight-bold">{{ selectedDest.name }}</div>
          <q-btn flat round dense icon="close" v-close-popup color="white" />
        </q-card-section>

        <q-card-section class="q-pa-lg">
          <div class="detail-img-container q-mb-md">
            <img :src="selectedDest.image" :alt="selectedDest.name" class="detail-img" />
          </div>

          <div class="q-mb-md">
            <div class="text-caption text-weight-bold text-grey-8">Description</div>
            <p class="text-body2 text-grey-8 q-mb-none">{{ selectedDest.description }}</p>
          </div>

          <div class="row q-col-gutter-sm q-mb-md">
            <div class="col-4">
              <div class="text-caption text-weight-bold text-grey-8">Ticket Price</div>
              <div class="text-subtitle2 text-weight-bold text-primary q-mt-xs">
                {{ selectedDest.ticketPrice > 0 ? `Rp ${Number(selectedDest.ticketPrice).toLocaleString('id-ID')}` : 'Gratis' }}
              </div>
            </div>

            <div class="col-4">
              <div class="text-caption text-weight-bold text-grey-8">Accessibility</div>
              <q-chip dense outline color="teal" class="text-weight-bold font-chip q-mt-xs">
                {{ selectedDest.accessibility }}
              </q-chip>
            </div>

            <div class="col-4">
              <div class="text-caption text-weight-bold text-grey-8">Coordinates</div>
              <div class="text-caption text-grey-8 text-weight-bold q-mt-xs" style="font-family: monospace">
                {{ selectedDest.latitude }}, {{ selectedDest.longitude }}
              </div>
            </div>
          </div>

          <div>
            <div class="text-caption text-weight-bold text-grey-8 q-mb-xs">Categories</div>
            <div class="row q-gutter-xs">
              <q-chip
                v-for="(cat, i) in selectedDest.categories"
                :key="i"
                dense
                class="bg-blue-1 text-primary text-weight-bold font-chip"
              >
                {{ cat }}
              </q-chip>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-px-lg">
          <q-btn flat no-caps label="Close" color="grey-8" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showEditModal">
      <q-card style="width: 520px; max-width: 90vw" class="rounded-borders-lg q-pb-md">
        <q-card-section class="row items-center justify-between bg-primary text-white q-py-sm">
          <div class="text-subtitle1 text-weight-bold">Edit Destination</div>
          <q-btn flat round dense icon="close" v-close-popup color="white" />
        </q-card-section>

        <q-card-section class="q-pa-lg" v-if="editForm">
          <q-form @submit.prevent="saveEditDestination">
            <div class="q-mb-sm">
              <div class="text-caption text-weight-bold text-grey-8 q-mb-xs">Destination Name</div>
              <q-input
                v-model="editForm.name"
                outlined
                dense
                bg-color="white"
                class="rounded-field"
                :rules="[(val) => !!val || 'Destination Name is required']"
                hide-bottom-space
              />
            </div>

            <div class="q-mb-sm">
              <div class="text-caption text-weight-bold text-grey-8 q-mb-xs">Description</div>
              <q-input
                v-model="editForm.description"
                type="textarea"
                rows="3"
                outlined
                dense
                bg-color="white"
                class="rounded-field"
              />
            </div>

            <div class="q-mb-sm">
              <div class="text-caption text-weight-bold text-grey-8 q-mb-xs">Entrance Ticket Price (Harga Tiket Masuk)</div>
              <q-input
                v-model="editForm.ticketPrice"
                type="number"
                prefix="Rp "
                outlined
                dense
                bg-color="white"
                class="rounded-field"
                placeholder="0 for Gratis"
              />
            </div>

            <div class="q-mb-sm">
              <div class="text-caption text-weight-bold text-grey-8 q-mb-xs">Accessibility</div>
              <q-select
                v-model="editForm.accessibility"
                :options="accessibilityOptions"
                outlined
                dense
                bg-color="white"
                class="rounded-field"
              />
            </div>

            <div class="q-mb-sm">
              <div class="text-caption text-weight-bold text-grey-8 q-mb-xs">Categories</div>
              <q-select
                v-model="editForm.categories"
                :options="categoryOptions"
                multiple
                use-chips
                outlined
                dense
                bg-color="white"
                class="rounded-field"
              />
            </div>

            <div class="row q-col-gutter-xs q-mb-md">
              <div class="col-6">
                <div class="text-caption text-grey-8 text-weight-bold q-mb-xs">Latitude</div>
                <q-input v-model="editForm.latitude" outlined dense bg-color="white" class="rounded-field" />
              </div>
              <div class="col-6">
                <div class="text-caption text-grey-8 text-weight-bold q-mb-xs">Longitude</div>
                <q-input v-model="editForm.longitude" outlined dense bg-color="white" class="rounded-field" />
              </div>
            </div>

            <div class="row justify-end q-gutter-x-sm">
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

    <q-dialog v-model="showDeleteModal">
      <q-card style="width: 400px; max-width: 90vw" class="rounded-borders-lg q-pa-md text-center">
        <div class="column items-center">
          <div class="delete-icon-wrapper q-mb-md">
            <q-icon name="warning_amber" size="36px" color="negative" />
          </div>
          <h3 class="text-h6 text-weight-bold text-grey-9 q-ma-none q-mb-xs">
            Confirm Delete
          </h3>
          <p class="text-body2 text-grey-7 q-mb-lg">
            Are you sure you want to delete <span class="text-weight-bold text-grey-9">"{{ selectedDest?.name }}"</span>?
          </p>

          <div class="row justify-center q-gutter-x-sm full-width">
            <q-btn flat label="Cancel" no-caps color="grey-8" v-close-popup />
            <q-btn
              color="negative"
              no-caps
              style="border-radius: 12px"
              label="Delete"
              icon="delete"
              @click="confirmDelete"
            />
          </div>
        </div>
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

const showDetailModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const selectedDest = ref(null)

const editForm = ref({
  id: null,
  name: '',
  description: '',
  accessibility: '',
  categories: [],
  latitude: '',
  longitude: '',
})

const accessibilityOptions = [
  'Good Road Access',
  'Wheelchair Ramp',
  'Public Transportation',
  'Spacious Parking',
  'Public Restrooms',
  'Information Center',
]

const categoryOptions = [
  'Beach & Marine Tourism',
  'Cultural & Historical',
  'Shopping & Urban',
  'Nature & Eco-Tourism',
  'Culinary Tourism',
  'Recreation & Entertainment',
]

const showStatusFeedback = ref(false)
const feedbackConfig = ref({
  type: 'success',
  title: '',
  message: '',
})

const columns = [
  {
    name: 'index',
    label: '#',
    field: 'id',
    align: 'center',
    style: 'width: 50px;',
  },
  {
    name: 'name',
    label: 'Destination Name',
    field: 'name',
    align: 'left',
    sortable: true,
  },
  {
    name: 'photo',
    label: 'Photo',
    field: 'image',
    align: 'center',
  },
  {
    name: 'category',
    label: 'Categories',
    field: 'categories',
    align: 'left',
  },
  {
    name: 'accessibility',
    label: 'Accessibility',
    field: 'accessibility',
    align: 'center',
  },
  {
    name: 'ticketPrice',
    label: 'Ticket Price',
    field: 'ticketPrice',
    align: 'center',
    sortable: true,
  },
  {
    name: 'coords',
    label: 'Coordinates',
    field: 'latitude',
    align: 'center',
  },
  {
    name: 'actions',
    label: 'Actions',
    field: 'id',
    align: 'center',
  },
]

const destinations = ref([
  {
    id: 1,
    name: 'Welcome to Batam Landmark',
    image: report1Img,
    description: 'Iconic tourist landmark located in central Batam city with spacious public area and photo spots.',
    categories: ['Shopping & Urban', 'Cultural & Historical'],
    accessibility: 'Good Road Access',
    ticketPrice: 0,
    latitude: '1.128450',
    longitude: '104.053210',
  },
  {
    id: 2,
    name: 'Barelang Bridge',
    image: report2Img,
    description: 'Architectural marvel connecting Batam, Rempang, and Galang islands with panoramic sea views.',
    categories: ['Historical & Cultural', 'Nature & Eco-Tourism'],
    accessibility: 'Good Road Access',
    ticketPrice: 0,
    latitude: '0.985620',
    longitude: '104.041830',
  },
  {
    id: 3,
    name: 'Pantai Nongsa Beach',
    image: report1Img,
    description: 'Beautiful sandy beach resort area with views of neighboring skyline and water sports activities.',
    categories: ['Beach & Marine Tourism'],
    accessibility: 'Public Transportation',
    ticketPrice: 15000,
    latitude: '1.182300',
    longitude: '104.112400',
  },
  {
    id: 4,
    name: 'Pantai Melayu',
    image: report2Img,
    description: 'Popular family beach destination with calm waves, gazebo rentals, and local seafood stalls.',
    categories: ['Beach & Marine Tourism', 'Culinary Tourism'],
    accessibility: 'Spacious Parking',
    ticketPrice: 10000,
    latitude: '0.923100',
    longitude: '104.152000',
  },
  {
    id: 5,
    name: 'Pantai Batu Hoda',
    image: report1Img,
    description: 'Picturesque coastal beach known for unique rock formations and eco-friendly visitor facilities.',
    categories: ['Beach & Marine Tourism', 'Nature & Eco-Tourism'],
    accessibility: 'Wheelchair Ramp',
    ticketPrice: 20000,
    latitude: '1.054200',
    longitude: '104.089100',
  },
])

const filteredDestinations = computed(() => {
  if (!filterSearch.value) return destinations.value
  const q = filterSearch.value.toLowerCase()
  return destinations.value.filter(
    (item) =>
      item.name.toLowerCase().includes(q) ||
      item.categories.some((c) => c.toLowerCase().includes(q)) ||
      item.accessibility.toLowerCase().includes(q)
  )
})

function openDetailModal(dest) {
  selectedDest.value = dest
  showDetailModal.value = true
}

function openEditModal(dest) {
  selectedDest.value = dest
  editForm.value = {
    id: dest.id,
    name: dest.name,
    description: dest.description || '',
    accessibility: dest.accessibility,
    categories: [...dest.categories],
    ticketPrice: dest.ticketPrice,
    latitude: dest.latitude,
    longitude: dest.longitude,
  }
  showEditModal.value = true
}

function saveEditDestination() {
  if (!editForm.value.name) return
  const idx = destinations.value.findIndex((d) => d.id === editForm.value.id)
  if (idx !== -1) {
    destinations.value[idx].name = editForm.value.name
    destinations.value[idx].description = editForm.value.description
    destinations.value[idx].accessibility = editForm.value.accessibility
    destinations.value[idx].categories = editForm.value.categories
    destinations.value[idx].ticketPrice = editForm.value.ticketPrice
    destinations.value[idx].latitude = editForm.value.latitude
    destinations.value[idx].longitude = editForm.value.longitude
  }
  showEditModal.value = false

  feedbackConfig.value = {
    type: 'success',
    title: 'Destination Updated',
    message: `Destination "${editForm.value.name}" has been updated successfully.`,
  }
  showStatusFeedback.value = true
}

function openDeleteModal(dest) {
  selectedDest.value = dest
  showDeleteModal.value = true
}

function confirmDelete() {
  if (selectedDest.value) {
    const destName = selectedDest.value.name
    destinations.value = destinations.value.filter((d) => d.id !== selectedDest.value.id)
    showDeleteModal.value = false

    feedbackConfig.value = {
      type: 'success',
      title: 'Destination Deleted',
      message: `Destination "${destName}" has been removed.`,
    }
    showStatusFeedback.value = true
  }
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

.font-chip {
  font-size: 11px;
}

:deep(.q-field__control) {
  border-radius: 12px !important;
}

.search-input {
  width: 460px;
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

.detail-img-container {
  width: 100%;
  max-height: 240px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
}

.detail-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.rounded-borders-lg {
  border-radius: 16px;
}

.delete-icon-wrapper {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-color: #fef2f2;
  border: 2px solid #fecaca;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>

<style lang="scss">
.custom-dest-table {
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