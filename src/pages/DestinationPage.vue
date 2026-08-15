<template>
  <q-page class="page-container bg-grey-2">
    <div class="max-width-container">
      <div class="row items-center justify-between q-mb-sm">
        <div class="col-12 col-md-auto q-mb-sm-res">
          <h1 class="text-weight-bold text-grey-9 q-ma-none font-header">
            Destination List & Management
          </h1>
          <p class="text-grey-7 q-mt-xs q-mb-none font-subtitle">
            View, search, manage, and add mapped tourism destinations
          </p>
        </div>
      </div>

      <div class="row items-center justify-between q-col-gutter-sm q-my-md">
        <div class="col-12 col-sm-7 col-md-5">
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
        </div>

        <div class="col-12 col-sm-auto row justify-end">
          <q-btn
            color="primary"
            icon="add"
            label="Add New Destination"
            no-caps
            style="border-radius: 12px"
            class="text-weight-bold add-btn"
            to="/admin/destination/add"
          />
        </div>
      </div>

      <q-card flat class="table-card q-pa-xs-res">
        <q-table
          :rows="filteredDestinations"
          :columns="columns"
          row-key="id"
          flat
          class="custom-dest-table"
          :loading="isLoadingDestinations"
          :grid="$q.screen.xs"
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
                class="table-img-wrapper cursor-pointer flex flex-center bg-grey-2"
                @click="openDetailModal(props.row)"
              >
                <img
                  v-if="props.row.image && isUrl(props.row.image)"
                  :src="formatImageUrl(props.row.image)"
                  :alt="props.row.name"
                  class="table-img"
                />
                <div v-else class="column items-center justify-center text-grey-6 q-pa-xs">
                  <q-icon name="image_not_supported" size="22px" />
                  <span style="font-size: 9px; font-weight: 600" class="q-mt-xs">No Photo</span>
                </div>
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
                  class="bg-blue-1 text-primary text-weight-bold font-chip q-pa-md"
                >
                  {{ cat }}
                </q-chip>
              </div>
            </q-td>
          </template>

          <template #body-cell-accessibility="props">
            <q-td :props="props">
              <div v-if="props.row.accessibilities && props.row.accessibilities.length > 0" class="row q-gutter-xs">
                <q-chip
                  v-for="(acc, i) in props.row.accessibilities"
                  :key="i"
                  dense
                  outline
                  color="teal"
                  class="text-weight-bold font-chip"
                >
                  {{ acc }}
                </q-chip>
              </div>
              <span v-else class="text-grey-6">-</span>
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

          <template #item="props">
            <div class="q-pa-xs col-xs-12 col-sm-6">
              <q-card flat bordered class="q-pa-md rounded-borders-lg bg-white shadow-1">
                <div class="row items-center justify-between q-mb-sm">
                  <span class="text-caption text-weight-bold text-grey-6">#{{ props.rowIndex + 1 }}</span>
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
                      color="primary"
                      icon="edit"
                      size="sm"
                      @click="openEditModal(props.row)"
                    />
                    <q-btn
                      flat
                      round
                      dense
                      color="negative"
                      icon="delete"
                      size="sm"
                      @click="openDeleteModal(props.row)"
                    />
                  </div>
                </div>

                <div class="row items-center q-gutter-x-sm q-mb-sm">
                  <div class="table-img-wrapper cursor-pointer flex flex-center bg-grey-2" @click="openDetailModal(props.row)">
                    <img
                      v-if="props.row.image && isUrl(props.row.image)"
                      :src="formatImageUrl(props.row.image)"
                      :alt="props.row.name"
                      class="table-img"
                    />
                    <div v-else class="column items-center justify-center text-grey-6 q-pa-xs">
                      <q-icon name="image_not_supported" size="22px" />
                      <span style="font-size: 9px; font-weight: 600" class="q-mt-xs">No Photo</span>
                    </div>
                  </div>
                  <div class="column">
                    <span class="text-subtitle2 text-weight-bold text-grey-9">{{ props.row.name }}</span>
                    <span class="text-caption text-weight-bold text-primary">
                      {{ props.row.ticketPrice > 0 ? `Rp ${Number(props.row.ticketPrice).toLocaleString('id-ID')}` : 'Gratis' }}
                    </span>
                  </div>
                </div>

                <div class="row q-gutter-xs q-mt-xs">
                  <q-chip
                    v-for="(cat, i) in props.row.categories"
                    :key="'cat-' + i"
                    dense
                    class="bg-blue-1 text-primary text-weight-bold font-chip"
                  >
                    {{ cat }}
                  </q-chip>
                  <q-chip
                    v-for="(acc, i) in props.row.accessibilities"
                    :key="'acc-' + i"
                    dense
                    outline
                    color="teal"
                    class="text-weight-bold font-chip"
                  >
                    {{ acc }}
                  </q-chip>
                </div>
              </q-card>
            </div>
          </template>
        </q-table>
      </q-card>
    </div>

    <q-dialog v-model="showDetailModal">
      <q-card style="width: 560px; max-width: 92vw" class="rounded-borders-lg q-pb-md" v-if="selectedDest">
        <q-card-section class="row items-center justify-between bg-primary text-white q-py-sm">
          <div class="text-subtitle1 text-weight-bold flex items-center q-gutter-x-xs">
            <q-icon name="place" size="20px" />
            <span>{{ selectedDest.name }}</span>
          </div>
          <q-btn flat round dense icon="close" v-close-popup color="white" />
        </q-card-section>

        <q-card-section class="q-pa-lg">
          <div class="detail-img-container q-mb-md">
            <template v-if="selectedDest.image && isUrl(selectedDest.image)">
              <img
                :src="formatImageUrl(selectedDest.image)"
                :alt="selectedDest.name"
                class="detail-img-blur"
              />
              <img
                :src="formatImageUrl(selectedDest.image)"
                :alt="selectedDest.name"
                class="detail-img"
              />
            </template>
            <div v-else class="column items-center justify-center text-grey-6 q-pa-lg">
              <q-icon name="image_not_supported" size="48px" />
              <span class="text-caption text-weight-bold q-mt-xs">No Photo Available</span>
            </div>
          </div>

          <div class="q-mb-md bg-grey-1 q-pa-md rounded-borders">
            <div class="text-caption text-weight-bold text-grey-8 row items-center q-mb-xs">
              <q-icon name="notes" size="16px" color="primary" class="q-mr-xs" />
              Description
            </div>
            <p class="text-body2 text-grey-9 q-mb-none" style="white-space: pre-line">
              {{ selectedDest.description || selectedDest.raw?.description || selectedDest.raw?.destination_description || selectedDest.raw?.desc || selectedDest.raw?.detail || selectedDest.raw?.details || 'No description available for this destination.' }}
            </p>
          </div>

          <div class="row q-col-gutter-sm q-mb-md">
            <div class="col-12 col-sm-6">
              <div class="q-pa-sm bg-grey-1 rounded-borders fill-height">
                <div class="text-caption text-weight-bold text-grey-8 row items-center q-mb-xs">
                  <q-icon name="payments" size="16px" color="primary" class="q-mr-xs" />
                  Entrance Ticket Price
                </div>
                <div class="text-subtitle1 text-weight-bolder text-primary">
                  {{ selectedDest.ticketPrice > 0 ? `Rp ${Number(selectedDest.ticketPrice).toLocaleString('id-ID')}` : 'Gratis' }}
                </div>
              </div>
            </div>

            <div class="col-12 col-sm-6">
              <div class="q-pa-sm bg-grey-1 rounded-borders fill-height">
                <div class="text-caption text-weight-bold text-grey-8 row items-center q-mb-xs">
                  <q-icon name="schedule" size="16px" color="primary" class="q-mr-xs" />
                  Operating Hours
                </div>
                <div class="text-subtitle2 text-weight-bold text-grey-9 q-mt-xs">
                  {{ formatOperatingHours(selectedDest.opening_time, selectedDest.closing_time) }}
                </div>
              </div>
            </div>
          </div>

          <div class="row q-col-gutter-sm q-mb-md">
            <div class="col-12 col-sm-6">
              <div class="q-pa-sm bg-grey-1 rounded-borders fill-height">
                <div class="text-caption text-weight-bold text-grey-8 row items-center q-mb-xs">
                  <q-icon name="accessible" size="16px" color="primary" class="q-mr-xs" />
                  Facilities
                </div>
                <div v-if="selectedDest.accessibilities && selectedDest.accessibilities.length > 0" class="row q-gutter-xs q-mt-xs">
                  <q-chip
                    v-for="(acc, i) in selectedDest.accessibilities"
                    :key="i"
                    dense
                    outline
                    color="teal"
                    class="text-weight-bold font-chip"
                  >
                    {{ acc }}
                  </q-chip>
                </div>
                <div v-else class="text-grey-6 q-mt-xs">-</div>
              </div>
            </div>

            <div class="col-12 col-sm-6">
              <div class="q-pa-sm bg-grey-1 rounded-borders fill-height">
                <div class="text-caption text-weight-bold text-grey-8 row items-center q-mb-xs">
                  <q-icon name="category" size="16px" color="primary" class="q-mr-xs" />
                  Categories
                </div>
                <div class="row q-gutter-xs q-mt-xs">
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
            </div>
          </div>

          <div class="row q-col-gutter-sm q-mb-md">
            <div class="col-12">
              <div class="q-pa-sm bg-grey-1 rounded-borders fill-height">
                <div class="text-caption text-weight-bold text-grey-8 row items-center q-mb-xs">
                  <q-icon name="my_location" size="16px" color="primary" class="q-mr-xs" />
                  Location Coordinates
                </div>
                <div class="text-caption text-grey-9 text-weight-bold q-mt-xs" style="font-family: monospace">
                  {{ selectedDest.latitude }}, {{ selectedDest.longitude }}
                </div>
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-px-lg q-pb-md">
          <q-btn
            color="primary"
            unelevated
            no-caps
            label="Close"
            style="border-radius: 12px; padding: 6px 24px"
            class="text-weight-bold"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showEditModal">
      <q-card style="width: 540px; max-width: 92vw" class="rounded-borders-lg q-pb-md">
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
                placeholder="Enter description..."
              />
            </div>

            <div class="q-mb-sm">
              <div class="text-caption text-weight-bold text-grey-8 q-mb-xs">Entrance Ticket Price (Harga Tiket Masuk)</div>
              <q-input
                v-model="editFormDisplayTicketPrice"
                prefix="Rp "
                outlined
                dense
                bg-color="white"
                class="rounded-field"
                placeholder="0 for Gratis"
              />
            </div>

            <div class="q-mb-sm">
              <div class="text-caption text-weight-bold text-grey-8 q-mb-xs">Facilities</div>
              <q-select
                v-model="editForm.accessibilities"
                :options="accessibilityFilteredOptions"
                :loading="isLoadingAccessibility"
                multiple
                use-chips
                use-input
                input-debounce="0"
                @filter="filterAccessibility"
                outlined
                dense
                bg-color="white"
                class="rounded-field"
                placeholder="Type to search & select facilities..."
              />
            </div>

            <div class="q-mb-sm">
              <div class="text-caption text-weight-bold text-grey-8 q-mb-xs">Categories</div>
              <q-select
                v-model="editForm.categories"
                :options="categoryFilteredOptions"
                :loading="isLoadingCategory"
                multiple
                use-chips
                use-input
                input-debounce="0"
                @filter="filterCategory"
                outlined
                dense
                bg-color="white"
                class="rounded-field"
                placeholder="Type to search & select categories..."
              />
            </div>

            <div class="row q-col-gutter-xs q-mb-sm">
              <div class="col-6">
                <div class="text-caption text-grey-8 text-weight-bold q-mb-xs">Opening Time (Jam Buka)</div>
                <q-input
                  v-model="editForm.opening_time"
                  type="time"
                  outlined
                  dense
                  bg-color="white"
                  class="rounded-field"
                />
              </div>
              <div class="col-6">
                <div class="text-caption text-grey-8 text-weight-bold q-mb-xs">Closing Time (Jam Tutup)</div>
                <q-input
                  v-model="editForm.closing_time"
                  type="time"
                  outlined
                  dense
                  bg-color="white"
                  class="rounded-field"
                />
              </div>
            </div>

            <div class="row q-col-gutter-xs q-mb-sm">
              <div class="col-6">
                <div class="text-caption text-grey-8 text-weight-bold q-mb-xs">Latitude</div>
                <q-input v-model="editForm.latitude" outlined dense bg-color="white" class="rounded-field" />
              </div>
              <div class="col-6">
                <div class="text-caption text-grey-8 text-weight-bold q-mb-xs">Longitude</div>
                <q-input v-model="editForm.longitude" outlined dense bg-color="white" class="rounded-field" />
              </div>
            </div>

            <div class="q-mb-md">
              <div class="text-caption text-weight-bold text-grey-8 q-mb-xs">Destination Photo</div>
              <q-file
                v-model="editForm.photoFile"
                outlined
                dense
                bg-color="white"
                class="rounded-field"
                accept="image/*"
                placeholder="Choose new photo file..."
                hide-bottom-space
                @update:model-value="onPhotoSelected"
              >
                <template #prepend>
                  <q-icon name="attach_file" color="grey-6" />
                </template>
              </q-file>

              <div v-if="photoPreview" class="q-mt-xs">
                <div class="text-caption text-grey-7 q-mb-xs">Photo Preview:</div>
                <div class="detail-img-container flex flex-center bg-grey-2" style="max-height: 140px;">
                  <img :src="photoPreview" alt="Destination Photo Preview" class="detail-img" />
                </div>
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
                :loading="isSubmittingEdit"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <ConfirmDeleteDialog
      v-model="showDeleteModal"
      :item-name="selectedDest?.name"
      @confirm="confirmDelete"
    />

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
import ConfirmDeleteDialog from 'components/ConfirmDeleteDialog.vue'

const filterSearch = ref('')

const showDetailModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const selectedDest = ref(null)
const photoPreview = ref(null)
const isSubmittingEdit = ref(false)

const editForm = ref({
  id: null,
  name: '',
  description: '',
  accessibility: '',
  accessibilities: [],
  categories: [],
  latitude: '',
  longitude: '',
  ticketPrice: 0,
  image: '',
  photoFile: null,
})

function onPhotoSelected(file) {
  if (file && file instanceof File) {
    const reader = new FileReader()
    reader.onload = (e) => {
      photoPreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  } else if (editForm.value?.image && isUrl(editForm.value.image)) {
    photoPreview.value = formatImageUrl(editForm.value.image)
  } else {
    photoPreview.value = null
  }
}

const editFormDisplayTicketPrice = computed({
  get() {
    if (editForm.value.ticketPrice === null || editForm.value.ticketPrice === undefined || editForm.value.ticketPrice === '') return ''
    const num = String(editForm.value.ticketPrice).replace(/\D/g, '')
    if (!num) return ''
    return Number(num).toLocaleString('id-ID')
  },
  set(val) {
    if (val === null || val === undefined || val === '') {
      editForm.value.ticketPrice = ''
      return
    }
    const cleanNum = String(val).replace(/\D/g, '')
    editForm.value.ticketPrice = cleanNum ? Number(cleanNum) : 0
  },
})

const accessibilityOptions = ref([])
const accessibilityFilteredOptions = ref([])
const categoryOptions = ref([])
const categoryFilteredOptions = ref([])

function filterAccessibility(val, update) {
  if (val === '') {
    update(() => {
      accessibilityFilteredOptions.value = accessibilityOptions.value
    })
    return
  }
  update(() => {
    const needle = val.toLowerCase()
    accessibilityFilteredOptions.value = accessibilityOptions.value.filter((v) =>
      v.toLowerCase().includes(needle)
    )
  })
}

function filterCategory(val, update) {
  if (val === '') {
    update(() => {
      categoryFilteredOptions.value = categoryOptions.value
    })
    return
  }
  update(() => {
    const needle = val.toLowerCase()
    categoryFilteredOptions.value = categoryOptions.value.filter((v) =>
      v.toLowerCase().includes(needle)
    )
  })
}

const isLoadingAccessibility = ref(false)
const isLoadingCategory = ref(false)
const rawAccessibilityList = ref([])

async function fetchAccessibilityOptions() {
  isLoadingAccessibility.value = true
  try {
    let response
    try {
      response = await api.get('/accessibility/')
    } catch {
      response = await api.get('/accessibility')
    }
    const resData = response.data
    const list = Array.isArray(resData)
      ? resData
      : resData?.data || resData?.accessibilities || resData?.accessibility || resData?.result || []

    rawAccessibilityList.value = list

    const mapped = list
      .map((item) => (typeof item === 'string' ? item : item.name || item.accessibility_name || item.title || ''))
      .filter(Boolean)

    accessibilityOptions.value = mapped.length > 0 ? mapped : [
      'Good Road Access',
      'Wheelchair Ramp',
      'Public Transportation',
      'Spacious Parking',
      'Public Restrooms',
      'Information Center',
    ]
    accessibilityFilteredOptions.value = accessibilityOptions.value
  } catch (error) {
    console.error('Error loading accessibility options:', error)
    accessibilityOptions.value = [
      'Good Road Access',
      'Wheelchair Ramp',
      'Public Transportation',
      'Spacious Parking',
      'Public Restrooms',
      'Information Center',
    ]
    accessibilityFilteredOptions.value = accessibilityOptions.value
  } finally {
    isLoadingAccessibility.value = false
  }
}

const rawCategoryList = ref([])

async function fetchCategoryOptions() {
  isLoadingCategory.value = true
  try {
    let response
    try {
      response = await api.get('/tourism/')
    } catch {
      response = await api.get('/tourism')
    }
    const resData = response.data
    const list = Array.isArray(resData)
      ? resData
      : resData?.data || resData?.tourism || resData?.tourism_types || resData?.result || []

    rawCategoryList.value = list

    const mapped = list
      .map((item) => (typeof item === 'string' ? item : item.name || item.tourism_name || item.type_name || item.title || ''))
      .filter(Boolean)

    categoryOptions.value = mapped.length > 0 ? mapped : [
      'Beach & Marine Tourism',
      'Cultural & Historical',
      'Shopping & Urban',
      'Nature & Eco-Tourism',
      'Culinary Tourism',
      'Recreation & Entertainment',
    ]
    categoryFilteredOptions.value = categoryOptions.value
  } catch (error) {
    console.error('Error loading category options:', error)
    categoryOptions.value = [
      'Beach & Marine Tourism',
      'Cultural & Historical',
      'Shopping & Urban',
      'Nature & Eco-Tourism',
      'Culinary Tourism',
      'Recreation & Entertainment',
    ]
    categoryFilteredOptions.value = categoryOptions.value
  } finally {
    isLoadingCategory.value = false
  }
}

onMounted(async () => {
  await Promise.all([
    fetchAccessibilityOptions(),
    fetchCategoryOptions(),
  ])
  await fetchDestinations()
})

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
    label: 'Facilities',
    field: 'accessibilities',
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

function parseArrayOrScalar(val) {
  if (!val && val !== 0) return []
  if (Array.isArray(val)) return val
  if (typeof val === 'string') {
    const trimmed = val.trim()
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed)
        if (Array.isArray(parsed)) return parsed
      } catch {
        // ignore
      }
    }
    if (trimmed.includes(',')) {
      return trimmed.split(',').map((s) => s.trim()).filter(Boolean)
    }
    if (trimmed) return [trimmed]
    return []
  }
  return [val]
}

const destinations = ref([])
const isLoadingDestinations = ref(false)

async function fetchDestinations() {
  isLoadingDestinations.value = true
  try {
    let response
    try {
      response = await api.get('/destinations/')
    } catch {
      try {
        response = await api.get('/destinations')
      } catch {
        try {
          response = await api.get('/destination/')
        } catch {
          response = await api.get('/destination')
        }
      }
    }
    const resData = response.data
    const list = Array.isArray(resData)
      ? resData
      : resData?.data || resData?.destinations || resData?.destination || resData?.result || []

    const mapped = list.map((item, index) => {
      // Tourism IDs (array or scalar or JSON string)
      const rawTourismIds = parseArrayOrScalar(item.tourism_id).concat(parseArrayOrScalar(item.tourism_type_id))
      const tourismIds = [...new Set(rawTourismIds)]

      let categoriesArr = parseArrayOrScalar(item.categories || item.category)

      if (categoriesArr.length === 0 && tourismIds.length > 0) {
        categoriesArr = tourismIds
          .map((tid) => {
            const found = rawCategoryList.value.find((c) => (c.id || c.tourism_id) == tid)
            return found ? (found.name || found.tourism_name || found.type_name || found.title) : null
          })
          .filter(Boolean)
      }

      // Accessibility IDs (array or scalar or JSON string)
      const rawAccIds = parseArrayOrScalar(item.accessibility_id).concat(parseArrayOrScalar(item.access_id))
      const accessibilityIds = [...new Set(rawAccIds)]

      let accessibilitiesArr = parseArrayOrScalar(item.accessibilities || item.accessibility)

      if (accessibilitiesArr.length === 0 && accessibilityIds.length > 0) {
        accessibilitiesArr = accessibilityIds
          .map((aid) => {
            const foundAcc = rawAccessibilityList.value.find((a) => (a.id || a.accessibility_id) == aid)
            return foundAcc ? (foundAcc.name || foundAcc.accessibility_name || foundAcc.title) : null
          })
          .filter(Boolean)
      }

      const ticketVal = item.entrance_fee !== undefined
        ? Number(item.entrance_fee)
        : (item.ticket_price !== undefined ? Number(item.ticket_price) : (item.ticketPrice !== undefined ? Number(item.ticketPrice) : 0))

      const rawImg = item.image_url || item.image || item.photo || item.picture || item.photo_url || ''
      const descVal = item.description || item.destination_description || item.desc || item.detail || item.details || item.info || ''

      const finalCategories = categoriesArr.length > 0 ? categoriesArr : ['Tourism']
      const finalAccessibilities = accessibilitiesArr

      return {
        id: item.id || item.destination_id || item._id || (index + 1),
        name: item.name || item.destination_name || item.title || '',
        description: descVal,
        image: rawImg,
        categories: finalCategories,
        tourism_ids: tourismIds,
        tourism_id: tourismIds[0] || 1,
        accessibilities: finalAccessibilities,
        accessibility: finalAccessibilities.join(', '),
        accessibility_ids: accessibilityIds,
        accessibility_id: accessibilityIds[0] || 1,
        ticketPrice: ticketVal,
        entrance_fee: ticketVal,
        latitude: item.latitude || item.lat || '1.060000',
        longitude: item.longitude || item.lng || '104.040000',
        opening_time: item.opening_time || item.open_time || '08:00:00',
        closing_time: item.closing_time || item.close_time || '17:00:00',
        raw: item,
      }
    })

    destinations.value = mapped
  } catch (error) {
    console.error('Error fetching destinations:', error)
    destinations.value = []
  } finally {
    isLoadingDestinations.value = false
  }
}

function formatOperatingHours(openTime, closeTime) {
  if (!openTime && !closeTime) return '08:00 - 17:00 WIB'
  const cleanOpen = String(openTime || '08:00').slice(0, 5)
  const cleanClose = String(closeTime || '17:00').slice(0, 5)
  return `${cleanOpen} - ${cleanClose} WIB`
}

function isUrl(str) {
  if (!str || typeof str !== 'string') return false
  return str.startsWith('http://') || str.startsWith('https://') || str.startsWith('data:image/') || str.startsWith('/')
}

function formatImageUrl(url) {
  if (!url || typeof url !== 'string') return ''

  // Jika URL absolut dari ngrok dan mengandung /static/, proxy lewat Vercel rewrite
  if (
    (url.startsWith('http://') || url.startsWith('https://')) &&
    url.includes('ngrok') &&
    url.includes('/static/')
  ) {
    const staticPath = url.substring(url.indexOf('/static/'))
    return staticPath // → /static/... → di-proxy oleh vercel.json
  }

  // Jika path relatif sudah /static/
  if (url.includes('/static/')) {
    const staticPath = url.substring(url.indexOf('/static/'))
    return staticPath
  }

  // URL lainnya langsung dikembalikan
  return url
}

const filteredDestinations = computed(() => {
  if (!filterSearch.value) return destinations.value
  const q = filterSearch.value.toLowerCase()
  return destinations.value.filter(
    (item) =>
      item.name.toLowerCase().includes(q) ||
      item.categories.some((c) => c.toLowerCase().includes(q)) ||
      item.accessibilities.some((a) => a.toLowerCase().includes(q)) ||
      item.accessibility.toLowerCase().includes(q)
  )
})

function openDetailModal(dest) {
  selectedDest.value = dest
  showDetailModal.value = true
}

function openEditModal(dest) {
  selectedDest.value = dest
  const descVal = dest.description || dest.raw?.description || dest.raw?.destination_description || dest.raw?.desc || dest.raw?.detail || dest.raw?.details || dest.raw?.info || ''
  const accList = Array.isArray(dest.accessibilities) && dest.accessibilities.length > 0
    ? [...dest.accessibilities]
    : (dest.accessibility ? [dest.accessibility] : [])

  editForm.value = {
    id: dest.id,
    name: dest.name,
    description: descVal,
    accessibilities: accList,
    accessibility: accList[0] || 'Good Road Access',
    categories: [...dest.categories],
    ticketPrice: dest.ticketPrice !== undefined ? dest.ticketPrice : dest.entrance_fee,
    latitude: dest.latitude,
    longitude: dest.longitude,
    opening_time: String(dest.opening_time || '08:00:00').slice(0, 5),
    closing_time: String(dest.closing_time || '17:00:00').slice(0, 5),
    tourism_id: dest.tourism_id || 1,
    image: dest.image || '',
    photoFile: null,
  }
  if (dest.image && isUrl(dest.image)) {
    photoPreview.value = formatImageUrl(dest.image)
  } else {
    photoPreview.value = null
  }
  showEditModal.value = true
}

async function saveEditDestination() {
  if (!editForm.value.name) return
  isSubmittingEdit.value = true

  const selectedCatNames = Array.isArray(editForm.value.categories)
    ? editForm.value.categories
    : [editForm.value.categories].filter(Boolean)

  const matchedTourismIds = selectedCatNames.map((catName) => {
    const found = rawCategoryList.value.find((c) => (c.name || c.tourism_name || c.title) === catName)
    return found ? Number(found.id || found.tourism_id) : null
  }).filter(Boolean)
  const tourismIdsArray = matchedTourismIds.length > 0 ? matchedTourismIds : [1]

  const selectedAccNames = Array.isArray(editForm.value.accessibilities)
    ? editForm.value.accessibilities
    : [editForm.value.accessibility].filter(Boolean)

  const matchedAccIds = selectedAccNames.map((accName) => {
    const found = rawAccessibilityList.value.find((a) => (a.name || a.accessibility_name || a.title) === accName)
    return found ? Number(found.id || found.accessibility_id) : null
  }).filter(Boolean)
  const accIdsArray = matchedAccIds.length > 0 ? matchedAccIds : [1]

  const numTicket = Number(editForm.value.ticketPrice) || 0
  const id = editForm.value.id

  const formattedOpenTime = editForm.value.opening_time ? `${editForm.value.opening_time.slice(0, 5)}:00` : '08:00:00'
  const formattedCloseTime = editForm.value.closing_time ? `${editForm.value.closing_time.slice(0, 5)}:00` : '17:00:00'

  const formData = new FormData()
  formData.append('name', editForm.value.name)
  formData.append('description', editForm.value.description || '')
  formData.append('opening_time', formattedOpenTime)
  formData.append('closing_time', formattedCloseTime)

  formData.append('tourism_id', JSON.stringify(tourismIdsArray))
  formData.append('tourism_type_id', JSON.stringify(tourismIdsArray))
  formData.append('accessibility_id', JSON.stringify(accIdsArray))
  formData.append('access_id', JSON.stringify(accIdsArray))

  selectedAccNames.forEach((acc) => {
    formData.append('accessibility[]', acc)
  })
  formData.append('accessibility', selectedAccNames.join(','))

  selectedCatNames.forEach((cat) => {
    formData.append('category[]', cat)
  })
  formData.append('category', selectedCatNames.join(','))

  accIdsArray.forEach((accId) => {
    formData.append('accessibility_id[]', String(accId))
    formData.append('access_id[]', String(accId))
  })

  tourismIdsArray.forEach((tId) => {
    formData.append('tourism_id[]', String(tId))
    formData.append('tourism_type_id[]', String(tId))
  })

  formData.append('entrance_fee', String(numTicket))
  formData.append('latitude', String(editForm.value.latitude))
  formData.append('longitude', String(editForm.value.longitude))

  if (editForm.value.photoFile && editForm.value.photoFile instanceof File) {
    formData.append('image_url', editForm.value.photoFile)
  }

  const reqConfigMultipart = {
    headers: {
      'ngrok-skip-browser-warning': 'true',
    },
  }

  let apiSuccess = false
  let lastError = null

  try {
    // Always use PUT with FormData (multipart) — matches Postman behavior
    try {
      await api.put(`/destinations/${id}`, formData, reqConfigMultipart)
      apiSuccess = true
    } catch {
      try {
        await api.put(`/destinations/${id}/`, formData, reqConfigMultipart)
        apiSuccess = true
      } catch (e) {
        lastError = e
      }
    }
  } catch (err) {
    lastError = err
  }

  isSubmittingEdit.value = false

  const newImg = photoPreview.value || editForm.value.image || ''

  // Update local client list for immediate UI reactivity
  const idx = destinations.value.findIndex((d) => d.id === id)
  if (idx !== -1) {
    destinations.value[idx].name = editForm.value.name
    destinations.value[idx].description = editForm.value.description
    destinations.value[idx].accessibilities = selectedAccNames
    destinations.value[idx].accessibility = selectedAccNames.join(', ')
    destinations.value[idx].categories = selectedCatNames
    destinations.value[idx].ticketPrice = numTicket
    destinations.value[idx].latitude = editForm.value.latitude
    destinations.value[idx].longitude = editForm.value.longitude
    destinations.value[idx].opening_time = formattedOpenTime
    destinations.value[idx].closing_time = formattedCloseTime
    if (newImg) {
      destinations.value[idx].image = newImg
    }
  }
  showEditModal.value = false

  if (apiSuccess) {
    feedbackConfig.value = {
      type: 'success',
      title: 'Destination Updated',
      message: `Destination "${editForm.value.name}" has been updated successfully.`,
    }
  } else {
    console.error('Error editing destination on server:', lastError)
    const errStatus = lastError?.response?.status ? ` (HTTP ${lastError.response.status})` : ''
    feedbackConfig.value = {
      type: 'error',
      title: 'Failed to Update Destination (Server Error)',
      message: `Gagal memperbarui destinasi di server backend${errStatus} (Endpoint 404 / Server Offline). Tampilan lokal telah diperbarui secara sementara.`,
    }
  }
  showStatusFeedback.value = true
}

function openDeleteModal(dest) {
  selectedDest.value = dest
  showDeleteModal.value = true
}

async function confirmDelete() {
  if (!selectedDest.value) return

  const destId = selectedDest.value.id
  const destName = selectedDest.value.name
  let apiSuccess = false
  try {
    try {
      await api.delete(`/destinations/${destId}/`)
      apiSuccess = true
    } catch {
      await api.delete(`/destinations/${destId}`)
      apiSuccess = true
    }
  } catch (error) {
    console.error('Error deleting destination on server:', error)
  }

  destinations.value = destinations.value.filter((d) => d.id !== destId)
  showDeleteModal.value = false

  if (apiSuccess) {
    feedbackConfig.value = {
      type: 'success',
      title: 'Destination Deleted',
      message: `Destination "${destName}" has been removed.`,
    }
  } else {
    feedbackConfig.value = {
      type: 'error',
      title: 'Failed to Delete Destination',
      message: `Gagal menghapus destinasi di server. Periksa koneksi backend.`,
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

.font-chip {
  font-size: 11px;
}

:deep(.q-field__control) {
  border-radius: 12px !important;
}

.search-input {
  width: 100%;
  max-width: 460px;
}

.add-btn {
  @media (max-width: 599px) {
    width: 100%;
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

.detail-img-container {
  width: 100%;
  height: 300px;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  background-color: #0f172a;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.detail-img-blur {
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

.detail-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  position: relative;
  z-index: 1;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
  border-radius: 8px;
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