<template>
  <img :src="resolvedSrc || defaultFallback" :alt="alt" v-bind="$attrs" @error="onError" />
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import placeholderImg from 'assets/placeholder.svg'

defineOptions({ inheritAttrs: false })

const props = defineProps({
  src: { type: String, default: '' },
  alt: { type: String, default: '' },
  fallback: { type: String, default: '' },
})

const defaultFallback = computed(() => props.fallback || placeholderImg)
const resolvedSrc = ref('')
const retryCount = ref(0)

function resolveUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return defaultFallback.value
  const target = rawUrl.trim()
  if (!target) return defaultFallback.value

  // Data URLs, Blobs, and bundled local assets
  if (target.startsWith('data:') || target.startsWith('blob:') || target.startsWith('/assets/')) {
    return target
  }

  // Strip full ngrok domain so request always goes through proxy (/static/...)
  // Locally: handled by Vite devServer proxy (which injects ngrok-skip-browser-warning)
  // On Vercel: handled by /api/static-proxy serverless function
  if (target.includes('/static/')) {
    return target.substring(target.indexOf('/static/'))
  }
  if (target.includes('/uploads/')) {
    return `/static${target.substring(target.indexOf('/uploads/'))}`
  }

  if (target.startsWith('http://') || target.startsWith('https://')) {
    return target
  }

  return `/static/${target.replace(/^\/+/, '')}`
}

function load(url) {
  retryCount.value = 0
  if (!url) {
    resolvedSrc.value = defaultFallback.value
    return
  }
  resolvedSrc.value = resolveUrl(url)
}

watch(() => props.src, load, { immediate: true })

function onError() {
  if (retryCount.value === 0) {
    retryCount.value = 1
    if (props.src && (props.src.includes('/static/') || props.src.includes('/uploads/'))) {
      const idx = props.src.indexOf('/static/') !== -1 ? props.src.indexOf('/static/') : props.src.indexOf('/uploads/')
      const rel = props.src.substring(idx)
      resolvedSrc.value = rel.startsWith('/uploads/') ? `/static${rel}` : rel
      return
    }
  }

  // Fallback to placeholder image
  resolvedSrc.value = defaultFallback.value
}
</script>
