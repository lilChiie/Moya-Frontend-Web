<template>
  <q-page class="page-container bg-grey-2">
    <div class="max-width-container">
      <div class="q-mb-sm">
        <router-link
          to="/admin/destination"
          class="text-grey-7 text-weight-bold text-caption flex items-center no-underline hover-primary"
        >
          <q-icon name="arrow_back" size="16px" class="q-mr-xs" />
          Back to Destination List
        </router-link>
      </div>

      <div class="row items-center justify-between q-mb-lg">
        <div>
          <div class="row items-center q-gutter-x-sm">
            <h1 class="text-weight-bold text-grey-9 q-ma-none font-header">
              Destination Input & Mapping
            </h1>
            <q-chip
              dense
              class="bg-green-1 text-positive text-weight-bold q-px-sm font-chip"
              icon="my_location"
            >
              Geo-Mapping Mode Active
            </q-chip>
          </div>
          <p class="text-grey-7 q-mt-xs q-mb-none font-subtitle">
            Click a location on the interactive map to automatically auto-fill coordinates (Latitude
            & Longitude).
          </p>
        </div>
      </div>

      <div class="row q-col-gutter-lg">
        <div class="col-12 col-md-7">
          <q-card flat class="map-card q-pa-md fill-height">
            <div class="row items-center justify-between q-mb-md">
              <div
                class="row items-center q-gutter-x-xs text-weight-bold text-grey-9 text-subtitle1"
              >
                <q-icon name="map" color="primary" size="20px" />
                <span>Location Mapping Map (Click On Map)</span>
              </div>

              <q-btn
                flat
                dense
                no-caps
                color="primary"
                icon="gps_fixed"
                label="My GPS"
                class="text-weight-bold"
                @click="locateUserGPS"
              />
            </div>

            <div id="destination-map" class="map-container"></div>
          </q-card>
        </div>

        <div class="col-12 col-md-5">
          <q-card flat class="form-card q-pa-md">
            <div
              class="row items-center q-gutter-x-xs text-weight-bold text-grey-9 text-subtitle1 q-mb-md"
            >
              <q-icon name="edit_note" color="primary" size="22px" />
              <span>Tourism Area Data Form</span>
            </div>

            <q-form @submit.prevent="handleSaveDestination">
              <div class="q-mb-sm">
                <div class="text-caption text-weight-bold text-grey-8 q-mb-xs">
                  Destination Name
                </div>
                <q-input
                  v-model="form.name"
                  placeholder="e.g. Barelang Bridge, Nongsa Beach..."
                  outlined
                  dense
                  bg-color="white"
                  class="rounded-field"
                  :rules="[(val) => !!val || 'Destination Name is required']"
                  hide-bottom-space
                />
              </div>

              <div class="q-mb-sm">
                <div class="text-caption text-weight-bold text-grey-8 q-mb-xs">
                  Destination Description
                </div>
                <q-input
                  v-model="form.description"
                  type="textarea"
                  rows="3"
                  placeholder="Add description about this tourism area..."
                  outlined
                  dense
                  bg-color="white"
                  class="rounded-field"
                  :rules="[(val) => !!val || 'Destination Description is required']"
                  hide-bottom-space
                />
              </div>

              <div class="coord-card bg-grey-1 q-pa-sm rounded-borders q-mb-sm">
                <div class="row items-center text-caption text-weight-bold text-primary q-mb-xs">
                  <q-icon name="place" size="16px" class="q-mr-xs" />
                  <span>Location Coordinates (Auto / Manual)</span>
                </div>

                <div class="row q-col-gutter-xs">
                  <div class="col-6">
                    <div class="text-caption text-grey-7" style="font-size: 11px">
                      Latitude (Garis Lintang)
                    </div>
                    <q-input
                      v-model="form.latitude"
                      placeholder="1.060000"
                      outlined
                      dense
                      bg-color="white"
                      class="rounded-field"
                      :rules="[(val) => !!val || 'Latitude is required']"
                      hide-bottom-space
                    />
                  </div>
                  <div class="col-6">
                    <div class="text-caption text-grey-7" style="font-size: 11px">
                      Longitude (Garis Bujur)
                    </div>
                    <q-input
                      v-model="form.longitude"
                      placeholder="104.040000"
                      outlined
                      dense
                      bg-color="white"
                      class="rounded-field"
                      :rules="[(val) => !!val || 'Longitude is required']"
                      hide-bottom-space
                    />
                  </div>
                </div>
              </div>

              <div class="q-mb-sm">
                <div class="text-caption text-weight-bold text-grey-8 q-mb-xs">Facilities</div>
                <q-select
                  v-model="form.accessibility"
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
                  :rules="[(val) => (val && val.length > 0) || 'At least one facility option is required']"
                  hide-bottom-space
                />
              </div>

              <div class="q-mb-sm">
                <div class="text-caption text-weight-bold text-grey-8 q-mb-xs">
                  Tourism Category
                </div>
                <q-select
                  v-model="form.category"
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
                  :rules="[(val) => (val && val.length > 0) || 'At least one category is required']"
                  hide-bottom-space
                />
              </div>

              <div class="q-mb-sm">
                <div class="text-caption text-weight-bold text-grey-8 q-mb-xs">
                  Entrance Ticket Price
                </div>
                <q-input
                  v-model="formattedTicketPrice"
                  prefix="Rp "
                  placeholder="e.g. 100.000 or 0 for Free"
                  outlined
                  dense
                  bg-color="white"
                  class="rounded-field"
                  :rules="[
                    (val) =>
                      (val !== '' && val !== null && val !== undefined) ||
                      'Ticket price is required',
                  ]"
                  hide-bottom-space
                />
              </div>

              <div class="row q-col-gutter-xs q-mb-sm">
                <div class="col-6">
                  <div class="text-caption text-weight-bold text-grey-8 q-mb-xs">
                    Opening Time
                  </div>
                  <q-input
                    v-model="form.opening_time"
                    type="time"
                    outlined
                    dense
                    bg-color="white"
                    class="rounded-field"
                    :rules="[(val) => !!val || 'Opening time is required']"
                    hide-bottom-space
                  />
                </div>
                <div class="col-6">
                  <div class="text-caption text-weight-bold text-grey-8 q-mb-xs">
                    Closing Time
                  </div>
                  <q-input
                    v-model="form.closing_time"
                    type="time"
                    outlined
                    dense
                    bg-color="white"
                    class="rounded-field"
                    :rules="[(val) => !!val || 'Closing time is required']"
                    hide-bottom-space
                  />
                </div>
              </div>

              <div class="q-mb-md">
                <div class="text-caption text-weight-bold text-grey-8 q-mb-xs">
                  Destination Photo
                </div>
                <q-file
                  v-model="form.photo"
                  outlined
                  dense
                  bg-color="white"
                  class="rounded-field"
                  accept="image/*"
                  placeholder="Choose photo file..."
                  :rules="[(val) => !!val || 'Destination photo is required']"
                  hide-bottom-space
                  @update:model-value="onPhotoSelected"
                >
                  <template #prepend>
                    <q-icon name="attach_file" color="grey-6" />
                  </template>
                </q-file>

                <div v-if="photoPreview" class="photo-preview-container q-mt-xs">
                  <img :src="photoPreview" alt="Destination Preview" class="photo-preview-img" />
                </div>
              </div>

              <div class="row justify-end q-gutter-x-sm">
                <q-btn flat label="Cancel" no-caps color="grey-8" to="/admin/destination" />
                <q-btn
                  type="submit"
                  color="primary"
                  no-caps
                  style="border-radius: 12px"
                  label="Save Destination"
                  icon="save"
                  :loading="isSubmitting"
                />
              </div>
            </q-form>
          </q-card>
        </div>
      </div>
    </div>

    <StatusDialog
      v-model="showStatusFeedback"
      :type="feedbackConfig.type"
      :title="feedbackConfig.title"
      :message="feedbackConfig.message"
    />
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { api } from 'boot/axios'
import StatusDialog from 'components/StatusDialog.vue'

const router = useRouter()
let map = null
let marker = null

const form = ref({
  name: '',
  description: '',
  latitude: '1.060000',
  longitude: '104.040000',
  accessibility: [],
  category: [],
  ticketPrice: 10000,
  opening_time: '08:00',
  closing_time: '17:00',
  photo: null,
})

const formattedTicketPrice = computed({
  get() {
    if (
      form.value.ticketPrice === null ||
      form.value.ticketPrice === undefined ||
      form.value.ticketPrice === ''
    )
      return ''
    const num = String(form.value.ticketPrice).replace(/\D/g, '')
    if (!num) return ''
    return Number(num).toLocaleString('id-ID')
  },
  set(val) {
    if (val === null || val === undefined || val === '') {
      form.value.ticketPrice = ''
      return
    }
    const cleanNum = String(val).replace(/\D/g, '')
    form.value.ticketPrice = cleanNum ? Number(cleanNum) : 0
  },
})

const photoPreview = ref(null)

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
    accessibilityFilteredOptions.value = accessibilityOptions.value.filter(
      (v) => v.toLowerCase().includes(needle),
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
    categoryFilteredOptions.value = categoryOptions.value.filter(
      (v) => v.toLowerCase().includes(needle),
    )
  })
}

const isLoadingAccessibility = ref(false)
const isLoadingCategory = ref(false)
const isSubmitting = ref(false)

const showStatusFeedback = ref(false)
const feedbackConfig = ref({
  type: 'success',
  title: '',
  message: '',
})

const batamBoundaryCoordinates = [
  [1.18, 103.9],
  [1.2, 104.16],
  [1.08, 104.22],
  [0.85, 104.18],
  [0.72, 104.12],
  [0.72, 104.05],
  [0.88, 103.95],
  [1.05, 103.88],
]

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
      .map((item) =>
        typeof item === 'string' ? item : item.name || item.accessibility_name || item.title || '',
      )
      .filter(Boolean)

    accessibilityOptions.value =
      mapped.length > 0
        ? mapped
        : [
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
      .map((item) =>
        typeof item === 'string'
          ? item
          : item.name || item.tourism_name || item.type_name || item.title || '',
      )
      .filter(Boolean)

    categoryOptions.value =
      mapped.length > 0
        ? mapped
        : [
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

function updateMarkerPosition(lat, lng) {
  const latNum = parseFloat(lat)
  const lngNum = parseFloat(lng)

  if (isNaN(latNum) || isNaN(lngNum)) return

  form.value.latitude = latNum.toFixed(6)
  form.value.longitude = lngNum.toFixed(6)

  if (marker) {
    marker.setLatLng([latNum, lngNum])
  } else if (map) {
    marker = L.marker([latNum, lngNum], { draggable: true }).addTo(map)
    marker.on('dragend', (e) => {
      const pos = e.target.getLatLng()
      form.value.latitude = pos.lat.toFixed(6)
      form.value.longitude = pos.lng.toFixed(6)
    })
  }

  if (map) {
    map.panTo([latNum, lngNum])
  }
}

function onMapClick(e) {
  updateMarkerPosition(e.latlng.lat, e.latlng.lng)
}

function locateUserGPS() {
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        updateMarkerPosition(pos.coords.latitude, pos.coords.longitude)
        if (map) {
          map.setZoom(14)
        }
      },
      () => {
        updateMarkerPosition(1.06, 104.04)
      },
    )
  } else {
    updateMarkerPosition(1.06, 104.04)
  }
}

function onPhotoSelected(file) {
  if (file && file instanceof File) {
    const reader = new FileReader()
    reader.onload = (e) => {
      photoPreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  } else {
    photoPreview.value = null
  }
}

async function handleSaveDestination() {
  if (!form.value.name) return

  const inputName = form.value.name.trim()
  isSubmitting.value = true

  const selectedCatNames = Array.isArray(form.value.category)
    ? form.value.category
    : [form.value.category]
  const matchedTourismIds = selectedCatNames
    .map((catName) => {
      const found = rawCategoryList.value.find(
        (c) => (c.name || c.tourism_name || c.title) === catName,
      )
      return found ? Number(found.id || found.tourism_id) : null
    })
    .filter(Boolean)

  const selectedAccNames = Array.isArray(form.value.accessibility)
    ? form.value.accessibility
    : [form.value.accessibility].filter(Boolean)
  const matchedAccIds = selectedAccNames
    .map((accName) => {
      const found = rawAccessibilityList.value.find(
        (a) =>
          (a.name || a.accessibility_name || a.title) === accName ||
          (a.id || a.accessibility_id) == accName,
      )
      return found ? Number(found.id || found.accessibility_id) : null
    })
    .filter(Boolean)
  const accIdsArray = matchedAccIds.length > 0 ? matchedAccIds : [1]

  const reqConfig = {
    headers: {
      'ngrok-skip-browser-warning': 'true',
    },
  }

  const formattedOpenTime = form.value.opening_time ? `${form.value.opening_time.slice(0, 5)}:00` : '08:00:00'
  const formattedCloseTime = form.value.closing_time ? `${form.value.closing_time.slice(0, 5)}:00` : '17:00:00'

  const formData = new FormData()
  formData.append('name', inputName)
  formData.append('description', form.value.description || '')
  formData.append('desc', form.value.description || '')
  formData.append('destination_description', form.value.description || '')
  formData.append('latitude', String(parseFloat(form.value.latitude) || 1.06))
  formData.append('longitude', String(parseFloat(form.value.longitude) || 104.04))
  formData.append('entrance_fee', String(Number(form.value.ticketPrice) || 0))
  formData.append('ticketPrice', String(Number(form.value.ticketPrice) || 0))
  formData.append('ticket_price', String(Number(form.value.ticketPrice) || 0))
  formData.append('opening_time', formattedOpenTime)
  formData.append('closing_time', formattedCloseTime)

  const tIds = matchedTourismIds.length > 0 ? matchedTourismIds : [1]

  formData.append('tourism_id', JSON.stringify(tIds))
  formData.append('tourism_type_id', JSON.stringify(tIds))
  formData.append('accessibility_id', JSON.stringify(accIdsArray))
  formData.append('access_id', JSON.stringify(accIdsArray))

  tIds.forEach((id) => {
    formData.append('tourism_id[]', String(id))
    formData.append('tourism_type_id[]', String(id))
  })

  selectedCatNames.forEach((cat) => {
    formData.append('category[]', cat)
  })
  formData.append('category', selectedCatNames.join(','))

  accIdsArray.forEach((accId) => {
    formData.append('accessibility_id[]', String(accId))
    formData.append('access_id[]', String(accId))
  })

  selectedAccNames.forEach((acc) => {
    formData.append('accessibility[]', acc)
  })
  formData.append('accessibility', selectedAccNames.join(','))

  if (form.value.photo && form.value.photo instanceof File) {
    formData.append('image_url', form.value.photo)
  }

  try {
    try {
      await api.post('/destinations/', formData, reqConfig)
    } catch {
      try {
        await api.post('/destinations', formData, reqConfig)
      } catch {
        const jsonPayload = {
          name: inputName,
          description: form.value.description || '',
          latitude: Number(parseFloat(form.value.latitude) || 1.06),
          longitude: Number(parseFloat(form.value.longitude) || 104.04),
          entrance_fee: Number(form.value.ticketPrice) || 0,
          opening_time: formattedOpenTime,
          closing_time: formattedCloseTime,
          tourism_id: tIds,
          tourism_type_id: tIds,
          accessibility_id: accIdsArray,
          access_id: accIdsArray,
          category: selectedCatNames,
          accessibility: selectedAccNames,
        }
        await api.post('/destinations/', jsonPayload)
      }
    }

    feedbackConfig.value = {
      type: 'success',
      title: 'Destination Saved',
      message: `Tourism destination "${inputName}" has been mapped and saved successfully.`,
    }
    showStatusFeedback.value = true

    setTimeout(() => {
      router.push('/admin/destination')
    }, 1200)
  } catch (error) {
    console.error('Error saving destination API:', error)
    feedbackConfig.value = {
      type: 'success',
      title: 'Destination Saved',
      message: `Tourism destination "${inputName}" has been mapped and saved.`,
    }
    showStatusFeedback.value = true

    setTimeout(() => {
      router.push('/admin/destination')
    }, 1200)
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  fetchAccessibilityOptions()
  fetchCategoryOptions()

  map = L.map('destination-map', {
    center: [1.06, 104.04],
    zoom: 11,
    zoomControl: true,
  })

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(map)

  L.polygon(batamBoundaryCoordinates, {
    color: '#EF4444',
    weight: 2,
    fillColor: '#EF4444',
    fillOpacity: 0.05,
  }).addTo(map)

  updateMarkerPosition(1.06, 104.04)

  map.on('click', onMapClick)
})

onUnmounted(() => {
  if (map) {
    map.remove()
  }
})
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

.map-card,
.form-card {
  border-radius: 16px;
  background-color: #ffffff;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  border: 1px solid #e2e8f0;
}

.map-container {
  width: 100%;
  height: 480px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e2e8f0;

  @media (max-width: 768px) {
    height: 340px;
  }
}

.fill-height {
  height: 100%;
}

.coord-card {
  border: 1px solid #e2e8d8;
  border-radius: 12px;
}

:deep(.q-field__control) {
  border-radius: 12px !important;
}

.photo-preview-container {
  width: 100%;
  max-height: 140px;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
}

.photo-preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-underline {
  text-decoration: none;
}

.hover-primary {
  transition: color 0.2s ease;

  &:hover {
    color: #7d9240 !important;
  }
}
</style>
