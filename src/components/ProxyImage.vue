<template>
  <img :src="resolvedSrc || fallback" :alt="alt" v-bind="$attrs" @error="onError" />
</template>

<script setup>
import { ref, watch, onBeforeUnmount } from 'vue'
import axios from 'axios'

defineOptions({ inheritAttrs: false })

const props = defineProps({
  src: { type: String, default: '' },
  alt: { type: String, default: '' },
  fallback: { type: String, default: '' },
})

const resolvedSrc = ref('')
let blobUrl = null

// Axios khusus untuk file statis (tanpa baseURL /api)
// Header ngrok-skip-browser-warning dikirim ke Vercel proxy → diteruskan ke ngrok upstream
const staticAxios = axios.create({
  headers: {
    'ngrok-skip-browser-warning': 'true',
    'ngrok-skip-browser-warning': '1',
  },
})

async function load(url) {
  // Bersihkan blob URL lama
  if (blobUrl) {
    URL.revokeObjectURL(blobUrl)
    blobUrl = null
  }

  if (!url) {
    resolvedSrc.value = ''
    return
  }

  // Aset lokal / data URI / blob URI → langsung pakai
  if (url.startsWith('data:') || url.startsWith('blob:') || url.startsWith('/assets/')) {
    resolvedSrc.value = url
    return
  }

  // URL yang mengandung /static/ → fetch via axios agar header ngrok terkirim
  const needsProxy = url.includes('/static/') || url.includes('ngrok')
  if (!needsProxy) {
    resolvedSrc.value = url
    return
  }

  try {
    const token = localStorage.getItem('token')
    const headers = { 'ngrok-skip-browser-warning': 'true' }
    if (token) headers['Authorization'] = `Bearer ${token}`

    const { data } = await staticAxios.get(url, {
      responseType: 'blob',
      headers,
    })

    blobUrl = URL.createObjectURL(data)
    resolvedSrc.value = blobUrl
  } catch {
    resolvedSrc.value = ''
  }
}

watch(() => props.src, load, { immediate: true })

onBeforeUnmount(() => {
  if (blobUrl) URL.revokeObjectURL(blobUrl)
})

function onError() {
  if (props.fallback && resolvedSrc.value !== props.fallback) {
    resolvedSrc.value = props.fallback
  }
}
</script>
