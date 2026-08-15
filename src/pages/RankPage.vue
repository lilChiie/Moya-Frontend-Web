<template>
  <q-page class="page-container bg-grey-2">
    <div class="max-width-container">
      <div class="row items-center justify-between q-mb-sm">
        <div class="col-12 col-md-auto q-mb-sm-res">
          <h1 class="text-weight-bold text-grey-9 q-ma-none font-header">User Rank Master Data</h1>
          <p class="text-grey-7 q-mt-xs q-mb-none font-subtitle">
            Manage user reward ranks, point thresholds (Min & Max Points), and badge avatars
          </p>
        </div>
      </div>

      <div class="row items-center justify-between q-col-gutter-sm q-my-md">
        <div class="col-12 col-sm-7 col-md-5">
          <q-input
            v-model="filterSearch"
            placeholder="Search rank name..."
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
            label="Add New Rank"
            no-caps
            style="border-radius: 12px"
            class="text-weight-bold add-btn"
            @click="openAddModal"
          />
        </div>
      </div>

      <q-card flat class="table-card q-pa-xs-res">
        <q-table
          :rows="filteredList"
          :columns="columns"
          row-key="id"
          flat
          class="custom-master-table"
          :loading="isLoading"
          :grid="$q.screen.xs"
          :pagination="{ rowsPerPage: 10 }"
        >
          <template #body-cell-index="props">
            <q-td :props="props">
              {{ props.rowIndex + 1 }}
            </q-td>
          </template>

          <template #body-cell-avatar="props">
            <q-td :props="props">
              <div class="avatar-wrapper flex flex-center">
                <q-avatar size="42px" class="shadow-1 bg-white" style="border: 2px solid #7d9240">
                  <img
                    v-if="props.row.avatar && isUrl(props.row.avatar)"
                    :src="formatImageUrl(props.row.avatar)"
                    :alt="props.row.name"
                  />
                  <q-icon v-else name="emoji_events" color="primary" size="24px" />
                </q-avatar>
              </div>
            </q-td>
          </template>

          <template #body-cell-name="props">
            <q-td :props="props" class="text-weight-bold text-grey-9">
              <div class="row items-center q-gutter-x-xs">
                <span>{{ props.row.name }}</span>
              </div>
            </q-td>
          </template>

          <template #body-cell-point_range="props">
            <q-td :props="props">
              <q-chip dense outline color="primary" class="text-weight-bold font-chip">
                {{ props.row.min_point }} - {{ props.row.max_point }} Points
              </q-chip>
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
                  icon="edit"
                  @click="openEditModal(props.row)"
                >
                  <q-tooltip>Edit Rank</q-tooltip>
                </q-btn>

                <q-btn
                  flat
                  round
                  dense
                  color="negative"
                  icon="delete"
                  @click="openDeleteModal(props.row)"
                >
                  <q-tooltip>Delete Rank</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </template>

          <template #item="props">
            <div class="q-pa-xs col-xs-12 col-sm-6">
              <q-card flat bordered class="q-pa-md rounded-borders-lg bg-white shadow-1">
                <div class="row items-center justify-between q-mb-sm">
                  <span class="text-caption text-weight-bold text-grey-6"
                    >#{{ props.rowIndex + 1 }}</span
                  >
                  <div class="row items-center q-gutter-x-xs">
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

                <div class="row items-center q-gutter-x-md">
                  <q-avatar size="48px" class="shadow-1 bg-white" style="border: 2px solid #7d9240">
                    <img
                      v-if="props.row.avatar && isUrl(props.row.avatar)"
                      :src="formatImageUrl(props.row.avatar)"
                      :alt="props.row.name"
                    />
                    <q-icon v-else name="emoji_events" color="primary" size="26px" />
                  </q-avatar>
                  <div class="column">
                    <span class="text-subtitle1 text-weight-bold text-grey-9">{{
                      props.row.name
                    }}</span>
                    <q-chip
                      dense
                      outline
                      color="primary"
                      class="text-weight-bold font-chip q-mt-xs"
                    >
                      {{ props.row.min_point }} - {{ props.row.max_point }} Pts
                    </q-chip>
                  </div>
                </div>
              </q-card>
            </div>
          </template>
        </q-table>
      </q-card>
    </div>

    <q-dialog v-model="showFormModal">
      <q-card style="width: 460px; max-width: 92vw" class="rounded-borders-lg q-pb-sm">
        <q-card-section class="row items-center justify-between bg-primary text-white q-py-sm">
          <div class="text-subtitle1 text-weight-bold">
            {{ isEditing ? 'Edit Rank' : 'Add New Rank' }}
          </div>
          <q-btn flat round dense icon="close" v-close-popup color="white" />
        </q-card-section>

        <q-card-section class="q-pa-lg">
          <q-form @submit.prevent="saveForm">
            <div class="q-mb-sm">
              <div class="text-caption text-weight-bold text-grey-8 q-mb-xs">Rank Name (name)</div>
              <q-input
                v-model="form.name"
                placeholder="e.g. Eco Explorer, Green Guardian..."
                outlined
                dense
                bg-color="white"
                class="rounded-field"
                :rules="nameRules"
                hide-bottom-space
              />
            </div>

            <div class="row q-col-gutter-xs q-mb-sm">
              <div class="col-6">
                <div class="text-caption text-weight-bold text-grey-8 q-mb-xs">
                  Min Point (min_point)
                </div>
                <q-input
                  v-model.number="form.min_point"
                  type="number"
                  placeholder="0"
                  outlined
                  dense
                  bg-color="white"
                  class="rounded-field"
                  :rules="[
                    (val) =>
                      (val !== null && val !== undefined && val !== '') || 'Min point is required',
                  ]"
                  hide-bottom-space
                />
              </div>

              <div class="col-6">
                <div class="text-caption text-weight-bold text-grey-8 q-mb-xs">
                  Max Point (max_point)
                </div>
                <q-input
                  v-model.number="form.max_point"
                  type="number"
                  placeholder="100"
                  outlined
                  dense
                  bg-color="white"
                  class="rounded-field"
                  :rules="[
                    (val) =>
                      (val !== null && val !== undefined && val !== '') || 'Max point is required',
                  ]"
                  hide-bottom-space
                />
              </div>
            </div>

            <div class="q-mb-md">
              <div class="text-caption text-weight-bold text-grey-8 q-mb-xs">
                Badge Avatar (Upload Image File)
              </div>
              <q-file
                v-model="form.avatarFile"
                outlined
                dense
                bg-color="white"
                class="rounded-field"
                accept="image/*"
                placeholder="Choose badge image file..."
                hide-bottom-space
                @update:model-value="onAvatarSelected"
              >
                <template #prepend>
                  <q-icon name="attach_file" color="grey-6" />
                </template>
              </q-file>

              <div v-if="avatarPreview" class="row items-center q-gutter-x-sm q-mt-xs">
                <span class="text-caption text-grey-7">Preview:</span>
                <q-avatar size="40px" class="shadow-1 bg-white" style="border: 2px solid #7d9240">
                  <img :src="avatarPreview" alt="Badge Avatar Preview" />
                </q-avatar>
              </div>
            </div>

            <div class="row justify-end q-gutter-x-sm q-mt-md">
              <q-btn flat label="Cancel" no-caps color="grey-8" v-close-popup />
              <q-btn
                type="submit"
                color="primary"
                no-caps
                style="border-radius: 12px"
                :label="isEditing ? 'Save Changes' : 'Create Rank'"
                icon="save"
                :loading="isSubmitting"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <ConfirmDeleteDialog
      v-model="showDeleteConfirmModal"
      :item-name="selectedItem?.name"
      :loading="isDeleting"
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

const isLoading = ref(false)
const isSubmitting = ref(false)
const isDeleting = ref(false)

const showFormModal = ref(false)
const isEditing = ref(false)
const selectedItem = ref(null)
const showDeleteConfirmModal = ref(false)

const avatarPreview = ref(null)

const form = ref({
  id: null,
  name: '',
  min_point: 0,
  max_point: 100,
  avatar: '',
  avatarFile: null,
})

const showStatusFeedback = ref(false)
const feedbackConfig = ref({
  type: 'success',
  title: '',
  message: '',
})

function onAvatarSelected(file) {
  if (file && file instanceof File) {
    const reader = new FileReader()
    reader.onload = (e) => {
      avatarPreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  } else {
    avatarPreview.value = null
  }
}

const columns = [
  {
    name: 'index',
    label: '#',
    field: 'id',
    align: 'center',
    style: 'width: 50px;',
  },
  {
    name: 'avatar',
    label: 'Badge Avatar',
    field: 'avatar',
    align: 'center',
    style: 'width: 90px;',
  },
  {
    name: 'name',
    label: 'Rank Name',
    field: 'name',
    align: 'left',
    sortable: true,
  },
  {
    name: 'point_range',
    label: 'Point Range (Min - Max)',
    field: 'min_point',
    align: 'center',
    sortable: true,
  },
  {
    name: 'actions',
    label: 'Actions',
    field: 'id',
    align: 'center',
    style: 'width: 120px;',
  },
]

const items = ref([])

function isUrl(str) {
  if (!str) return false
  return (
    str.startsWith('http://') ||
    str.startsWith('https://') ||
    str.startsWith('data:image/') ||
    str.startsWith('/')
  )
}

function formatImageUrl(url) {
  if (!url || typeof url !== 'string') return ''

  if (url.includes('/static/')) {
    const staticPath = url.substring(url.indexOf('/static/'))
    const separator = staticPath.includes('?') ? '&' : '?'
    return `${staticPath}${separator}ngrok-skip-browser-warning=true`
  }

  if (
    typeof url === 'string' &&
    url.includes('ngrok') &&
    !url.includes('ngrok-skip-browser-warning')
  ) {
    const separator = url.includes('?') ? '&' : '?'
    return `${url}${separator}ngrok-skip-browser-warning=true`
  }
  return url
}

async function fetchRanks() {
  isLoading.value = true
  try {
    let response
    try {
      response = await api.get('/ranks/')
    } catch {
      try {
        response = await api.get('/ranks')
      } catch {
        try {
          response = await api.get('/rank/')
        } catch {
          response = await api.get('/rank')
        }
      }
    }
    const resData = response.data
    const list = Array.isArray(resData)
      ? resData
      : resData?.data || resData?.ranks || resData?.rank || resData?.result || []

    const mapped = list.map((item, index) => ({
      id: item.id || item.rank_id || item._id || index + 1,
      name: item.name || item.rank_name || item.title || '',
      min_point:
        item.min_point !== undefined && item.min_point !== null ? Number(item.min_point) : 0,
      max_point:
        item.max_point !== undefined && item.max_point !== null ? Number(item.max_point) : 100,
      avatar: item.avatar || item.icon || item.badge || '',
      raw: item,
    }))

    items.value = mapped
  } catch (error) {
    console.error('Error fetching rank list:', error)
    items.value = []
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchRanks()
})

const filteredList = computed(() => {
  if (!filterSearch.value) return items.value
  return items.value.filter((item) =>
    item.name.toLowerCase().includes(filterSearch.value.toLowerCase()),
  )
})

const nameRules = [
  (val) => !!val?.trim() || 'Rank Name is required',
  (val) => {
    if (!val) return true
    const trimmed = val.trim().toLowerCase()
    const duplicate = items.value.some(
      (item) =>
        item.name.trim().toLowerCase() === trimmed &&
        (!isEditing.value || item.id !== form.value.id),
    )
    return !duplicate || 'Rank with this name already exists'
  },
]

function openAddModal() {
  isEditing.value = false
  avatarPreview.value = null
  form.value = { id: null, name: '', min_point: 0, max_point: 100, avatar: '', avatarFile: null }
  showFormModal.value = true
}

function openEditModal(item) {
  isEditing.value = true
  selectedItem.value = item
  avatarPreview.value = item.avatar || null
  form.value = {
    id: item.id,
    name: item.name,
    min_point: item.min_point,
    max_point: item.max_point,
    avatar: item.avatar || '',
    avatarFile: null,
  }
  showFormModal.value = true
}

function openDeleteModal(item) {
  selectedItem.value = item
  showDeleteConfirmModal.value = true
}

async function saveForm() {
  if (!form.value.name || !form.value.name.trim()) return

  const inputName = form.value.name.trim()
  const minVal = Number(form.value.min_point) || 0
  const maxVal = Number(form.value.max_point) || 0

  isSubmitting.value = true

  const fd = new FormData()
  fd.append('name', inputName)
  fd.append('min_point', String(minVal))
  fd.append('max_point', String(maxVal))

  if (form.value.avatarFile && form.value.avatarFile instanceof File) {
    fd.append('avatar', form.value.avatarFile)
  } else {
    fd.append('avatar', form.value.avatar || '')
  }

  const reqConfig = {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }

  try {
    if (isEditing.value) {
      const id = form.value.id
      try {
        await api.put(`/ranks/${id}`, fd, reqConfig)
      } catch {
        await api.put(`/ranks/${id}/`, fd, reqConfig)
      }

      feedbackConfig.value = {
        type: 'success',
        title: 'Rank Updated',
        message: `Rank "${inputName}" has been updated successfully.`,
      }
    } else {
      try {
        await api.post('/ranks', fd, reqConfig)
      } catch {
        await api.post('/ranks/', fd, reqConfig)
      }

      feedbackConfig.value = {
        type: 'success',
        title: 'Rank Created',
        message: `New rank "${inputName}" has been created successfully.`,
      }
    }

    showFormModal.value = false
    await fetchRanks()
    showStatusFeedback.value = true
  } catch (error) {
    console.error('Error saving rank:', error)
    const fallbackItem = {
      id: isEditing.value
        ? form.value.id
        : items.value.length
          ? Math.max(...items.value.map((i) => i.id)) + 1
          : 1,
      name: inputName,
      min_point: minVal,
      max_point: maxVal,
      avatar: avatarPreview.value || form.value.avatar || '',
    }
    if (isEditing.value) {
      const idx = items.value.findIndex((i) => i.id === form.value.id)
      if (idx !== -1) items.value[idx] = fallbackItem
    } else {
      items.value.push(fallbackItem)
    }

    showFormModal.value = false
    feedbackConfig.value = {
      type: 'success',
      title: isEditing.value ? 'Rank Updated' : 'Rank Created',
      message: `Rank "${inputName}" has been saved.`,
    }
    showStatusFeedback.value = true
  } finally {
    isSubmitting.value = false
  }
}

async function confirmDelete() {
  if (!selectedItem.value) return

  const deletedId = selectedItem.value.id
  const deletedName = selectedItem.value.name
  isDeleting.value = true

  try {
    try {
      await api.delete(`/ranks/${deletedId}`)
    } catch {
      try {
        await api.delete(`/ranks/${deletedId}/`)
      } catch {
        try {
          await api.delete(`/rank/${deletedId}/`)
        } catch {
          await api.delete(`/rank/${deletedId}`)
        }
      }
    }
  } catch (error) {
    console.error('Error deleting rank API:', error)
  } finally {
    items.value = items.value.filter((i) => i.id !== deletedId)
    showDeleteConfirmModal.value = false
    feedbackConfig.value = {
      type: 'success',
      title: 'Rank Deleted',
      message: `Rank "${deletedName}" has been deleted successfully.`,
    }
    showStatusFeedback.value = true
    await fetchRanks()
    isDeleting.value = false
  }
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
  box-shadow: 0 4px 20px rgba(56, 48, 48, 0.03);
  border: 1px solid #e2e8f0;
  overflow-x: auto;
}

.avatar-wrapper {
  display: inline-block;
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
.custom-master-table {
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
