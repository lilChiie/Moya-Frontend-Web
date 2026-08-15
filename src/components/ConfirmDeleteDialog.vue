<template>
  <q-dialog v-model="isOpen" persistent transition-show="scale" transition-hide="scale">
    <q-card style="width: 400px; max-width: 92vw" class="delete-dialog-card q-pa-md text-center">
      <div class="column items-center">
        <div class="delete-icon-wrapper q-mb-md">
          <q-icon name="warning_amber" size="36px" color="negative" />
        </div>

        <h3 class="text-h6 text-weight-bold text-grey-9 q-ma-none q-mb-xs">
          {{ props.title }}
        </h3>

        <p class="text-body2 text-grey-7 q-mb-lg font-dialog-message">
          <slot name="message">
            Are you sure you want to delete
            <span class="text-weight-bold text-grey-9">"{{ props.itemName }}"</span>?
          </slot>
        </p>

        <div class="row justify-center q-gutter-x-sm full-width">
          <q-btn
            flat
            label="Cancel"
            no-caps
            color="grey-8"
            class="cancel-btn"
            @click="handleCancel"
          />
          <q-btn
            color="negative"
            no-caps
            style="border-radius: 12px"
            :label="props.confirmLabel"
            icon="delete"
            :loading="props.loading"
            class="text-weight-bold"
            @click="handleConfirm"
          />
        </div>
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: 'Confirm Delete',
  },
  itemName: {
    type: String,
    default: '',
  },
  confirmLabel: {
    type: String,
    default: 'Delete',
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

function handleConfirm() {
  emit('confirm')
}

function handleCancel() {
  isOpen.value = false
  emit('cancel')
}
</script>

<style scoped lang="scss">
.delete-dialog-card {
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  border: 1px solid #fecaca;
  background-color: #ffffff;
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

.font-dialog-message {
  line-height: 1.5;
  max-width: 320px;
}

.cancel-btn {
  border-radius: 12px;
}
</style>
