<template>
  <q-dialog v-model="isOpen" persistent transition-show="scale" transition-hide="scale">
    <q-card class="status-dialog-card q-pa-lg">
      <div class="column items-center text-center">
        <div :class="['status-icon-wrapper', `status-${props.type}`]" class="q-mb-md">
          <q-icon :name="config.icon" size="36px" :color="config.colorClass" />
        </div>

        <h3 class="text-h6 text-weight-bold text-grey-9 q-ma-none q-mb-xs font-dialog-title">
          {{ props.title || config.defaultTitle }}
        </h3>

        <p class="text-body2 text-grey-7 q-mb-none font-dialog-message" v-if="props.message">
          {{ props.message }}
        </p>

        <div
          v-if="props.type !== 'success' || props.showButtonOnSuccess"
          class="row justify-center q-gutter-x-sm full-width q-mt-md"
        >
          <q-btn
            v-if="props.showCancel"
            flat
            no-caps
            color="grey-7"
            class="dialog-btn cancel-btn"
            :label="props.cancelLabel"
            @click="handleCancel"
          />

          <q-btn
            unelevated
            no-caps
            :class="['dialog-btn', `btn-${props.type}`]"
            :label="props.confirmLabel"
            @click="handleConfirm"
          />
        </div>
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed, watch, onUnmounted } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
    default: 'success',
    validator: (val) => ['success', 'error', 'warning', 'info'].includes(val),
  },
  title: {
    type: String,
    default: '',
  },
  message: {
    type: String,
    default: '',
  },
  confirmLabel: {
    type: String,
    default: 'OK',
  },
  cancelLabel: {
    type: String,
    default: 'Cancel',
  },
  showCancel: {
    type: Boolean,
    default: false,
  },
  showButtonOnSuccess: {
    type: Boolean,
    default: false,
  },
  autoClose: {
    type: Boolean,
    default: true,
  },
  autoCloseDelay: {
    type: Number,
    default: 3000,
  },
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

let autoCloseTimer = null

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

function clearTimer() {
  if (autoCloseTimer) {
    clearTimeout(autoCloseTimer)
    autoCloseTimer = null
  }
}

watch(
  () => [isOpen.value, props.type],
  ([newVal, newType]) => {
    clearTimer()
    if (newVal && newType === 'success' && props.autoClose) {
      autoCloseTimer = setTimeout(() => {
        handleConfirm()
      }, props.autoCloseDelay)
    }
  },
  { immediate: true }
)

onUnmounted(() => {
  clearTimer()
})

const configMap = {
  success: {
    icon: 'check_circle',
    colorClass: 'positive',
    defaultTitle: 'Action Successful',
  },
  error: {
    icon: 'error_outline',
    colorClass: 'negative',
    defaultTitle: 'Action Failed',
  },
  warning: {
    icon: 'warning_amber',
    colorClass: 'warning',
    defaultTitle: 'Warning',
  },
  info: {
    icon: 'info',
    colorClass: 'info',
    defaultTitle: 'Information',
  },
}

const config = computed(() => configMap[props.type] || configMap.success)

function handleConfirm() {
  clearTimer()
  isOpen.value = false
  emit('confirm')
}

function handleCancel() {
  clearTimer()
  isOpen.value = false
  emit('cancel')
}
</script>

<style scoped lang="scss">
.status-dialog-card {
  width: 420px;
  max-width: 90vw;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8d8;
  background-color: #ffffff;
}

.status-icon-wrapper {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;

  &.status-success {
    background-color: #f2f6e9;
    border: 2px solid #c8d89c;
  }

  &.status-error {
    background-color: #fef2f2;
    border: 2px solid #fecaca;
  }

  &.status-warning {
    background-color: #fffbeb;
    border: 2px solid #fde68a;
  }

  &.status-info {
    background-color: #eff6ff;
    border: 2px solid #bfdbfe;
  }
}

.font-dialog-title {
  line-height: 1.3;
}

.font-dialog-message {
  line-height: 1.5;
  max-width: 340px;
}

.dialog-btn {
  border-radius: 12px;
  font-weight: 700;
  padding: 8px 24px;
  min-width: 100px;
  transition: all 0.2s ease;

  &.btn-success {
    background-color: #7d9240 !important;
    color: #ffffff !important;

    &:hover {
      background-color: #687b33 !important;
    }
  }

  &.btn-error {
    background-color: #ef4444 !important;
    color: #ffffff !important;

    &:hover {
      background-color: #dc2626 !important;
    }
  }

  &.btn-warning {
    background-color: #f59e0b !important;
    color: #ffffff !important;

    &:hover {
      background-color: #d97706 !important;
    }
  }

  &.btn-info {
    background-color: #3b82f6 !important;
    color: #ffffff !important;

    &:hover {
      background-color: #2563eb !important;
    }
  }
}

.cancel-btn {
  border-radius: 12px;
}
</style>
