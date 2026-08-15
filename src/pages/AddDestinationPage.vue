<template>
  <q-page class="q-py-xl q-px-lg bg-grey-2">
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
            <h1 class="text-h4 text-weight-bold text-grey-9 q-ma-none font-header">
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
          <p class="text-subtitle1 text-grey-7 q-mt-xs q-mb-none font-subtitle">
            Click a location on the interactive map to automatically auto-fill coordinates (Latitude & Longitude).
          </p>
        </div>
      </div>

      <div class="row q-col-gutter-lg">
        <div class="col-12 col-md-7">
          <q-card flat class="map-card q-pa-md fill-height">
            <div class="row items-center justify-between q-mb-md">
              <div class="row items-center q-gutter-x-xs text-weight-bold text-grey-9 text-subtitle1">
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
            <div class="row items-center q-gutter-x-xs text-weight-bold text-grey-9 text-subtitle1 q-mb-md">
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
                    <div class="text-caption text-grey-7" style="font-size: 11px;">Latitude (Garis Lintang)</div>
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
                    <div class="text-caption text-grey-7" style="font-size: 11px;">Longitude (Garis Bujur)</div>
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
                <div class="text-caption text-weight-bold text-grey-8 q-mb-xs">
                  Accessibility
                </div>
                <q-select
                  v-model="form.accessibility"
                  :options="accessibilityOptions"
                  outlined
                  dense
                  bg-color="white"
                  class="rounded-field"
                  placeholder="Select accessibility option..."
                  :rules="[(val) => !!val || 'Accessibility option is required']"
                  hide-bottom-space
                />
              </div>

              <div class="q-mb-sm">
                <div class="text-caption text-weight-bold text-grey-8 q-mb-xs">
                  Tourism Category
                </div>
                <q-select
                  v-model="form.category"
                  :options="categoryOptions"
                  multiple
                  use-chips
                  outlined
                  dense
                  bg-color="white"
                  class="rounded-field"
                  placeholder="Select tourism categories..."
                  :rules="[(val) => (val && val.length > 0) || 'At least one category is required']"
                  hide-bottom-space
                />
              </div>

              <div class="q-mb-sm">
                <div class="text-caption text-weight-bold text-grey-8 q-mb-xs">
                  Entrance Ticket Price
                </div>
                <q-input
                  v-model="form.ticketPrice"
                  type="number"
                  prefix="Rp "
                  placeholder="e.g. 10000 or 0 for Free"
                  outlined
                  dense
                  bg-color="white"
                  class="rounded-field"
                  :rules="[(val) => val !== '' && val !== null && val !== undefined || 'Ticket price is required']"
                  hide-bottom-space
                />
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
                <q-btn flat label="Cancel" no-caps color="grey-8" to="/admin/dashboard" />
                <q-btn
                  type="submit"
                  color="primary"
                  no-caps
                  style="border-radius: 12px"
                  label="Save Destination"
                  icon="save"
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
import { ref, onMounted, onUnmounted } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import StatusDialog from 'components/StatusDialog.vue'

let map = null
let marker = null

const form = ref({
  name: '',
  description: '',
  latitude: '1.060000',
  longitude: '104.040000',
  accessibility: 'Good Road Access',
  category: ['Beach & Marine Tourism', 'Nature & Eco-Tourism'],
  ticketPrice: '10000',
  photo: null,
})

const photoPreview = ref(null)

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
      }
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

function handleSaveDestination() {
  if (!form.value.name) return

  feedbackConfig.value = {
    type: 'success',
    title: 'Destination Saved',
    message: `Tourism destination "${form.value.name}" has been mapped and saved successfully.`,
  }
  showStatusFeedback.value = true
}

onMounted(() => {
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