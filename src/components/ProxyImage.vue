<template>
  <img :src="resolvedSrc || defaultFallback" :alt="alt" v-bind="$attrs" @error="onError" />
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import report1Img from 'assets/report1.jpg'

defineOptions({ inheritAttrs: false })

const props = defineProps({
  src: { type: String, default: '' },
  alt: { type: String, default: '' },
  fallback: { type: String, default: '' },
})

const NGROK_HOST = 'https://coronary-moonstone-grain.ngrok-free.dev'
const defaultFallback = computed(() => props.fallback || report1Img)
const resolvedSrc = ref('')
const retryCount = ref(0)

function resolveUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return defaultFallback.value
  let target = rawUrl.trim()
  if (!target) return defaultFallback.value

  // Data URLs, Blobs, and local bundled assets
  if (target.startsWith('data:') || target.startsWith('blob:') || target.startsWith('/assets/')) {
    return target
  }

  // Upgrade http:// to https:// for ngrok to prevent Mixed Content errors on Vercel
  if (target.startsWith('http://') && target.includes('ngrok')) {
    target = target.replace('http://', 'https://')
  }

  // If it's a relative path, convert to full ngrok HTTPS URL
  if (target.startsWith('/static/')) {
    target = `${NGROK_HOST}${target}`
  } else if (target.startsWith('/uploads/')) {
    target = `${NGROK_HOST}/static${target}`
  } else if (!target.startsWith('http://') && !target.startsWith('https://')) {
    target = `${NGROK_HOST}/static/${target.replace(/^\/+/, '')}`
  }

  // Ensure ngrok skip browser warning is present
  if (target.includes('ngrok') && !target.includes('ngrok-skip-browser-warning')) {
    const sep = target.includes('?') ? '&' : '?'
    target = `${target}${sep}ngrok-skip-browser-warning=true`
  }

  return target
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
    // Fallback attempt 1: Try relative /static path with skip warning
    if (props.src && (props.src.includes('/static/') || props.src.includes('/uploads/'))) {
      const idx = props.src.indexOf('/static/') !== -1 ? props.src.indexOf('/static/') : props.src.indexOf('/uploads/')
      const rel = props.src.substring(idx)
      const cleanRel = rel.startsWith('/uploads/') ? `/static${rel}` : rel
      resolvedSrc.value = `${cleanRel}${cleanRel.includes('?') ? '&' : '?'}ngrok-skip-browser-warning=true`
      return
    }
  }

  // Fallback attempt 2: Fallback to placeholder image
  resolvedSrc.value = defaultFallback.value
}
</script>
