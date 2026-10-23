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

const staticAxios = axios.create({
  headers: {
    'ngrok-skip-browser-warning': 'true',
  },
})

async function load(url) {
  if (blobUrl) {
    URL.revokeObjectURL(blobUrl)
    blobUrl = null
  }

  if (!url) {
    resolvedSrc.value = ''
    return
  }

  if (url.startsWith('data:') || url.startsWith('blob:') || url.startsWith('/assets/')) {
    resolvedSrc.value = url
    return
  }

  let targetUrl = url
  if (targetUrl.includes('/static/')) {
    targetUrl = targetUrl.substring(targetUrl.indexOf('/static/'))
  } else if (targetUrl.startsWith('http://') && targetUrl.includes('ngrok')) {
    targetUrl = targetUrl.replace('http://', 'https://')
  }

  if (targetUrl.startsWith('/static/')) {
    resolvedSrc.value = targetUrl
    return
  }
  if (targetUrl.includes('ngrok')) {
    try {
      const token = localStorage.getItem('token')
      const headers = { 'ngrok-skip-browser-warning': 'true' }
      if (token) headers['Authorization'] = `Bearer ${token}`

      const { data } = await staticAxios.get(targetUrl, {
        responseType: 'blob',
        headers,
      })

      blobUrl = URL.createObjectURL(data)
      resolvedSrc.value = blobUrl
      return
    } catch (_err) {
      console.warn('[ProxyImage] Failed to load external ngrok image via blob:', targetUrl, _err)
      resolvedSrc.value = targetUrl
      return
    }
  }

  resolvedSrc.value = targetUrl
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
