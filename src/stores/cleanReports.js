import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from 'boot/axios'

// Empty array default - dummy data removed
export const DEFAULT_SAMPLE_DIRTY_REPORTS = []

const STORAGE_KEY = 'moya_clean_reports_data_v1'

function extractReportId(item) {
  if (!item) return null
  const candidate =
    item.report_id ??
    item.reportId ??
    item.dirty_report_id ??
    item.dirtyReportId ??
    item.waste_report_id ??
    item.wasteReportId ??
    item.waste_id ??
    item.wasteId ??
    item.dirty_id ??
    item.laporan_kotor_id ??
    (typeof item.report === 'object' ? item.report?.id : item.report) ??
    (typeof item.waste_report === 'object' ? item.waste_report?.id : null) ??
    (typeof item.dirty_report === 'object' ? item.dirty_report?.id : null) ??
    null
  return candidate !== undefined && candidate !== null ? candidate : null
}

export const useCleanReportsStore = defineStore('cleanReports', () => {
  const cleanReports = ref([])
  const isLoaded = ref(false)
  const isLoading = ref(false)

  function saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanReports.value))
    } catch (e) {
      console.warn('Failed to save clean reports to localStorage:', e)
    }
  }

  const NGROK_HOST = 'https://coronary-moonstone-grain.ngrok-free.dev'

  function formatImageUrl(url) {
    if (!url || typeof url !== 'string') return ''
    let target = url.trim()
    if (!target) return ''

    if (target.startsWith('data:') || target.startsWith('blob:') || target.startsWith('/assets/')) {
      return target
    }
    if (target.startsWith('http://') && target.includes('ngrok')) {
      target = target.replace('http://', 'https://')
    }
    if (target.startsWith('/static/')) {
      target = `${NGROK_HOST}${target}`
    } else if (target.startsWith('/uploads/')) {
      target = `${NGROK_HOST}/static${target}`
    } else if (!target.startsWith('http://') && !target.startsWith('https://')) {
      target = `${NGROK_HOST}/static/${target.replace(/^\/+/, '')}`
    }
    if (target.includes('ngrok') && !target.includes('ngrok-skip-browser-warning')) {
      const sep = target.includes('?') ? '&' : '?'
      target = `${target}${sep}ngrok-skip-browser-warning=true`
    }
    return target
  }

  // Fetch clean reports from backend API
  async function fetchCleanReports() {
    isLoading.value = true
    try {
      let res
      try {
        res = await api.get('/clean-reports')
      } catch {
        res = await api.get('/clean-reports/')
      }
      const raw = res.data?.data || res.data || []

      if (Array.isArray(raw)) {
        cleanReports.value = raw.map((item) => ({
          id: item.id,
          report_id: extractReportId(item),
          destination_id: item.destination_id,
          destination_name:
            item.destination_name ||
            (item.destination ? item.destination.name : 'Destinasi Wisata'),
          reporter_name:
            item.user_name ||
            item.reporter_name ||
            (item.user ? item.user.name : 'Pengguna Mobile'),
          reporter_role:
            item.reporter_role ||
            (item.user?.role ? item.user.role : 'Warga / Wisatawan'),
          image_url: formatImageUrl(item.image_url),
          user_notes: item.notes || item.user_notes || '',
          admin_notes: item.admin_notes || '',
          status: item.status || 'pending',
          created_at: item.created_at || '',
          raw: item,
        }))
        saveToStorage()
      }
    } catch (e) {
      console.warn('Failed to fetch clean reports from API:', e)
    } finally {
      isLoading.value = false
      isLoaded.value = true
    }
  }

  function loadFromStorage() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        // Filter out legacy dummy entries (clean-1, clean-2, clean-3, sample-dirty)
        cleanReports.value = (Array.isArray(parsed) ? parsed : [])
          .filter((r) => r && !['clean-1', 'clean-2', 'clean-3'].includes(r.id) && !r.isSample)
          .map((r) => ({
            ...r,
            report_id: extractReportId(r) || r.report_id || null,
            image_url: formatImageUrl(r.image_url),
          }))
        saveToStorage()
      } else {
        cleanReports.value = []
      }
    } catch {
      cleanReports.value = []
    }
    isLoaded.value = true

    // Fetch fresh reports from backend API
    fetchCleanReports()
  }

  // Count pending verification clean reports
  const pendingCleanCount = computed(() => {
    return cleanReports.value.filter((r) => r.status === 'pending').length
  })

  // Count verified clean reports
  const verifiedCleanCount = computed(() => {
    return cleanReports.value.filter(
      (r) => r.status === 'resolved' || r.status === 'verified',
    ).length
  })

  /**
   * Mengambil semua clean reports yang tertaut ke laporan kotor (dirty report) tertentu.
   * @param {Object} dirtyReport - objek laporan kotor ({ id, destination_id, location, ... })
   * @returns {Array} daftar bukti bersih yang sesuai
   */
  function getCleanReportsForDirtyReport(dirtyReport) {
    if (!dirtyReport || !cleanReports.value || cleanReports.value.length === 0) return []

    return cleanReports.value.filter((cr) => {
      // 1. Prioritas Utama: Cocokkan via report_id / dirty_report_id jika tersedia
      if (cr.report_id && dirtyReport.id && dirtyReport.id !== '-') {
        return String(cr.report_id) === String(dirtyReport.id)
      }

      // 2. Jika cr belum memiliki report_id (fallback pencocokan destinasi):
      if (!cr.report_id) {
        // Cocokkan via destination_id
        if (
          cr.destination_id &&
          dirtyReport.destination_id &&
          String(cr.destination_id) === String(dirtyReport.destination_id)
        ) {
          return true
        }
        // Cocokkan via nama destinasi (case-insensitive exact match)
        const crDest = (cr.destination_name || '').trim().toLowerCase()
        const drLoc = (dirtyReport.location || dirtyReport.destination_name || '').trim().toLowerCase()
        if (crDest && drLoc && crDest === drLoc) {
          return true
        }
      }

      return false
    })
  }

  /**
   * Mengambil semua clean reports untuk seluruh laporan kotor dalam satu destinasi (tanpa duplikasi).
   * @param {Array} dirtyReports - array of dirty reports untuk destinasi ini
   * @param {Number|String} destinationId - id destinasi
   * @param {String} destinationName - nama destinasi
   * @returns {Array} daftar bukti bersih yang valid untuk destinasi ini
   */
  function getCleanReportsForDestinationGroup(dirtyReports = [], destinationId = null, destinationName = '') {
    if (!cleanReports.value || cleanReports.value.length === 0) return []

    const matchedIds = new Set()
    const result = []

    // 1. Kumpulkan bukti dari seluruh laporan kotor yang ada di destinasi ini
    if (Array.isArray(dirtyReports) && dirtyReports.length > 0) {
      dirtyReports.forEach((dr) => {
        const matches = getCleanReportsForDirtyReport(dr)
        matches.forEach((m) => {
          if (!matchedIds.has(m.id)) {
            matchedIds.add(m.id)
            result.push(m)
          }
        })
      })
    }

    // 2. Jika ada clean report yang belum tertaut ke report_id spesifik tetapi memiliki destination_id / nama destinasi yang sama
    cleanReports.value.forEach((cr) => {
      if (!cr.report_id && !matchedIds.has(cr.id)) {
        let isDestMatch = false
        if (destinationId && cr.destination_id && String(destinationId) === String(cr.destination_id)) {
          isDestMatch = true
        }
        if (!isDestMatch && destinationName && cr.destination_name) {
          const dName = destinationName.trim().toLowerCase()
          const crName = cr.destination_name.trim().toLowerCase()
          if (dName && crName && dName === crName) {
            isDestMatch = true
          }
        }
        if (isDestMatch) {
          matchedIds.add(cr.id)
          result.push(cr)
        }
      }
    })

    return result
  }

  // Get clean reports for a destination
  function getCleanReportsForDestination(destNameOrId) {
    if (!isLoaded.value) loadFromStorage()
    return cleanReports.value.filter((r) => {
      if (typeof destNameOrId === 'number' || !isNaN(Number(destNameOrId))) {
        if (Number(r.destination_id) === Number(destNameOrId)) return true
      }
      if (destNameOrId && typeof destNameOrId === 'string') {
        const query = destNameOrId.trim().toLowerCase()
        const target = (r.destination_name || '').toLowerCase()
        return target === query
      }
      return false
    })
  }

  // Admin resolves clean reports for a destination (either by destination ID or name)
  function resolveCleanReportsForDestination(destId, destName = '') {
    if (!isLoaded.value) loadFromStorage()
    let changed = false
    cleanReports.value.forEach((r) => {
      let match = false
      if (destId && String(r.destination_id) === String(destId)) {
        match = true
      }
      if (!match && destName && r.destination_name) {
        const q = String(destName).toLowerCase().trim()
        const target = String(r.destination_name).toLowerCase().trim()
        if (q === target) {
          match = true
        }
      }
      if (match && r.status === 'pending') {
        r.status = 'resolved'
        r.resolved_at = new Date().toISOString()
        changed = true
      }
    })
    if (changed) {
      saveToStorage()
    }
    return changed
  }

  function addCleanReport(reportData) {
    if (!isLoaded.value) loadFromStorage()
    const newReport = {
      id: reportData.id || `clean-${Date.now()}`,
      report_id: extractReportId(reportData),
      destination_id: reportData.destination_id || null,
      destination_name: reportData.destination_name || 'Tourist Destination',
      reporter_name: reportData.reporter_name || 'Mobile User',
      reporter_role: reportData.reporter_role || 'Citizen / Tourist',
      image_url: reportData.image_url || '',
      user_notes: reportData.user_notes || '',
      admin_notes: '',
      status: 'pending',
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
      resolved_at: null,
      matched_dirty_reports_count: reportData.matched_dirty_reports_count || 0,
    }
    cleanReports.value.unshift(newReport)
    saveToStorage()
    return newReport
  }

  function resetDefaults() {
    cleanReports.value = []
    saveToStorage()
  }

  return {
    cleanReports,
    isLoaded,
    isLoading,
    loadFromStorage,
    fetchCleanReports,
    pendingCleanCount,
    verifiedCleanCount,
    getCleanReportsForDirtyReport,
    getCleanReportsForDestinationGroup,
    getCleanReportsForDestination,
    resolveCleanReportsForDestination,
    addCleanReport,
    resetDefaults,
  }
})
