<template>
  <q-page class="q-py-xl q-px-lg bg-grey-2">
    <div class="max-width-container">
      <div class="row items-center justify-between q-mb-sm">
        <div>
          <h1 class="text-h4 text-weight-bold text-grey-9 q-ma-none font-header">
            Accessibility Master Data
          </h1>
          <p class="text-subtitle1 text-grey-7 q-mt-xs q-mb-none font-subtitle">
            Manage accessibility options used across tourism destinations
          </p>
        </div>

        <div class="row items-center justify-between full-width q-my-md">
          <q-input
            v-model="filterSearch"
            placeholder="Search accessibility..."
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
            label="Add Accessibility"
            no-caps
            style="border-radius: 12px"
            class="text-weight-bold"
            @click="openAddModal"
          />
        </div>
      </div>

      <q-card flat class="table-card q-pa-sm">
        <q-table
          :rows="filteredList"
          :columns="columns"
          row-key="id"
          flat
          class="custom-master-table"
          :loading="isLoading"
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
                  <q-tooltip>Edit Accessibility</q-tooltip>
                </q-btn>

                <q-btn
                  flat
                  round
                  dense
                  color="negative"
                  icon="delete"
                  @click="openDeleteModal(props.row)"
                >
                  <q-tooltip>Delete Accessibility</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </template>
        </q-table>
      </q-card>
    </div>

    <q-dialog v-model="showFormModal">
      <q-card style="width: 440px; max-width: 90vw" class="rounded-borders-lg q-pb-sm">
        <q-card-section class="row items-center justify-between bg-primary text-white q-py-sm">
          <div class="text-subtitle1 text-weight-bold">
            {{ isEditing ? 'Edit Accessibility' : 'Add Accessibility' }}
          </div>
          <q-btn flat round dense icon="close" v-close-popup color="white" />
        </q-card-section>

        <q-card-section class="q-pa-lg">
          <q-form @submit.prevent="saveForm">
            <div class="q-mb-md">
              <div class="text-caption text-weight-bold text-grey-8 q-mb-xs">
                Accessibility Name
              </div>
              <q-input
                v-model="form.name"
                placeholder="e.g. Good Road Access, Wheelchair Ramp..."
                outlined
                dense
                bg-color="white"
                class="rounded-field"
                :rules="nameRules"
                hide-bottom-space
              />
            </div>

            <div class="row justify-end q-gutter-x-sm q-mt-md">
              <q-btn flat label="Cancel" no-caps color="grey-8" v-close-popup />
              <q-btn
                type="submit"
                color="primary"
                no-caps
                style="border-radius: 12px"
                :label="isEditing ? 'Save Changes' : 'Create'"
                icon="save"
                :loading="isSubmitting"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showDeleteConfirmModal">
      <q-card style="width: 400px; max-width: 90vw" class="rounded-borders-lg q-pa-md text-center">
        <div class="column items-center">
          <div class="delete-icon-wrapper q-mb-md">
            <q-icon name="warning_amber" size="36px" color="negative" />
          </div>
          <h3 class="text-h6 text-weight-bold text-grey-9 q-ma-none q-mb-xs">
            Confirm Delete
          </h3>
          <p class="text-body2 text-grey-7 q-mb-lg">
            Are you sure you want to delete <span class="text-weight-bold text-grey-9">"{{ selectedItem?.name }}"</span>?
          </p>

          <div class="row justify-center q-gutter-x-sm full-width">
            <q-btn flat label="Cancel" no-caps color="grey-8" v-close-popup />
            <q-btn
              color="negative"
              no-caps
              style="border-radius: 12px"
              label="Delete"
              icon="delete"
              :loading="isDeleting"
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
import { ref, computed, onMounted } from 'vue'
import { api } from 'boot/axios'
import StatusDialog from 'components/StatusDialog.vue'

const filterSearch = ref('')

const isLoading = ref(false)
const isSubmitting = ref(false)
const isDeleting = ref(false)

const showFormModal = ref(false)
const isEditing = ref(false)
const selectedItem = ref(null)
const showDeleteConfirmModal = ref(false)

const form = ref({
  id: null,
  name: '',
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
    style: 'width: 60px;',
  },
  {
    name: 'name',
    label: 'Accessibility Name',
    field: 'name',
    align: 'left',
    sortable: true,
  },
  {
    name: 'actions',
    label: 'Actions',
    field: 'id',
    align: 'center',
    style: 'width: 140px;',
  },
]

const items = ref([])

async function fetchAccessibilityOptions() {
  isLoading.value = true
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

    items.value = list.map((item, index) => ({
      id: item.id || item.accessibility_id || item._id || (index + 1),
      name: item.name || item.accessibility_name || item.title || '',
      raw: item,
    }))
  } catch (error) {
    console.error('Error fetching accessibility options:', error)
    feedbackConfig.value = {
      type: 'error',
      title: 'Failed to Fetch Data',
      message: error.response?.data?.message || error.message || 'Unable to load accessibility options from server.',
    }
    showStatusFeedback.value = true
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchAccessibilityOptions()
})

const filteredList = computed(() => {
  if (!filterSearch.value) return items.value
  return items.value.filter((item) =>
    item.name.toLowerCase().includes(filterSearch.value.toLowerCase())
  )
})

const nameRules = [
  (val) => !!val?.trim() || 'Accessibility Name is required',
  (val) => {
    if (!val) return true
    const trimmed = val.trim().toLowerCase()
    const duplicate = items.value.some(
      (item) => item.name.trim().toLowerCase() === trimmed && (!isEditing.value || item.id !== form.value.id)
    )
    return !duplicate || 'Accessibility option with this name already exists'
  },
]

function openAddModal() {
  isEditing.value = false
  form.value = { id: null, name: '' }
  showFormModal.value = true
}

function openEditModal(item) {
  isEditing.value = true
  selectedItem.value = item
  form.value = { id: item.id, name: item.name }
  showFormModal.value = true
}

function openDeleteModal(item) {
  selectedItem.value = item
  showDeleteConfirmModal.value = true
}

async function saveForm() {
  if (!form.value.name || !form.value.name.trim()) return

  const inputName = form.value.name.trim()
  const isDuplicate = items.value.some(
    (item) => item.name.trim().toLowerCase() === inputName.toLowerCase() && (!isEditing.value || item.id !== form.value.id)
  )

  if (isDuplicate) {
    feedbackConfig.value = {
      type: 'warning',
      title: 'Duplicate Entry Warning',
      message: `Accessibility option "${inputName}" already exists! Duplicate entries are not allowed.`,
    }
    showStatusFeedback.value = true
    return
  }

  isSubmitting.value = true

  try {
    if (isEditing.value) {
      // Edit API call
      try {
        await api.put(`/accessibility/${form.value.id}/`, { name: inputName })
      } catch {
        try {
          await api.put(`/accessibility/${form.value.id}`, { name: inputName })
        } catch {
          await api.patch(`/accessibility/${form.value.id}/`, { name: inputName })
        }
      }

      feedbackConfig.value = {
        type: 'success',
        title: 'Accessibility Updated',
        message: `Accessibility option "${inputName}" has been updated successfully.`,
      }
    } else {
      // Create API call
      try {
        await api.post('/accessibility/', { name: inputName })
      } catch {
        await api.post('/accessibility', { name: inputName })
      }

      feedbackConfig.value = {
        type: 'success',
        title: 'Accessibility Created',
        message: `New accessibility option "${inputName}" has been created successfully.`,
      }
    }

    showFormModal.value = false
    await fetchAccessibilityOptions()
    showStatusFeedback.value = true
  } catch (error) {
    console.error('Error saving accessibility option:', error)
    feedbackConfig.value = {
      type: 'error',
      title: isEditing.value ? 'Update Failed' : 'Creation Failed',
      message: error.response?.data?.message || error.message || 'Failed to save accessibility option to server.',
    }
    showStatusFeedback.value = true
  } finally {
    isSubmitting.value = false
  }
}

async function confirmDelete() {
  if (!selectedItem.value) return

  isDeleting.value = true

  try {
    try {
      await api.delete(`/accessibility/${selectedItem.value.id}/`)
    } catch {
      await api.delete(`/accessibility/${selectedItem.value.id}`)
    }
    showDeleteConfirmModal.value = false

    feedbackConfig.value = {
      type: 'success',
      title: 'Accessibility Deleted',
      message: `Accessibility option "${selectedItem.value.name}" has been deleted successfully.`,
    }
    await fetchAccessibilityOptions()
    showStatusFeedback.value = true
  } catch (error) {
    console.error('Error deleting accessibility option:', error)
    feedbackConfig.value = {
      type: 'error',
      title: 'Delete Failed',
      message: error.response?.data?.message || error.message || 'Failed to delete accessibility option from server.',
    }
    showStatusFeedback.value = true
  } finally {
    isDeleting.value = false
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