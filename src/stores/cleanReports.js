import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from 'boot/axios'

// Empty array default - dummy data removed
export const DEFAULT_SAMPLE_DIRTY_REPORTS = []

const STORAGE_KEY = 'moya_clean_reports_data_v1'

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

  function formatImageUrl(url) {
    if (!url) return ''
    if (url.includes('/static/')) {
      return url.substring(url.indexOf('/static/'))
    }
    if (url.startsWith('http://') && url.includes('ngrok')) {
      return url.replace('http://', 'https://')
    }
    return url
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
          resolved_at: item.verified_at || item.resolved_at || null,
          matched_dirty_reports_count: item.matched_dirty_reports_count || 0,
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
        return target.includes(query) || query.includes(target)
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
        if (q.includes(target) || target.includes(q)) {
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

  // Admin marks a clean report as verified
  async function verifyCleanReport(cleanReportId, adminNotes = '') {
    if (!isLoaded.value) loadFromStorage()
    const report = cleanReports.value.find((r) => r.id === cleanReportId)

    // Call API verification if valid ID
    try {
      await api.put(`/clean-reports/${cleanReportId}/verify`, {
        status: 'verified',
        admin_notes: adminNotes || 'Verified clean by government admin.',
      })
    } catch (e) {
      console.warn('Failed to verify clean report via API:', e)
      throw e
    }

    if (report) {
      report.status = 'verified'
      report.admin_notes = adminNotes || 'Verified clean by government admin.'
      report.resolved_at = new Date().toISOString()
      saveToStorage()
    }

    return true
  }

  async function rejectCleanReport(cleanReportId, adminNotes = '') {
    if (!isLoaded.value) loadFromStorage()
    const report = cleanReports.value.find((r) => r.id === cleanReportId)

    try {
      await api.put(`/clean-reports/${cleanReportId}/verify`, {
        status: 'rejected',
        admin_notes: adminNotes || 'Laporan kebersihan ditolak.',
      })
    } catch (e) {
      console.warn('Failed to reject clean report via API:', e)
      throw e
    }

    if (report) {
      report.status = 'rejected'
      report.admin_notes = adminNotes || 'Laporan kebersihan ditolak.'
      report.resolved_at = new Date().toISOString()
      saveToStorage()
    }

    return true
  }

  function addCleanReport(reportData) {
    if (!isLoaded.value) loadFromStorage()
    const newReport = {
      id: reportData.id || `clean-${Date.now()}`,
      destination_id: reportData.destination_id || null,
      destination_name: reportData.destination_name || 'Destinasi Wisata',
      reporter_name: reportData.reporter_name || 'Pengguna Mobile',
      reporter_role: reportData.reporter_role || 'Warga / Wisatawan',
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
    getCleanReportsForDestination,
    verifyCleanReport,
    rejectCleanReport,
    resolveCleanReportsForDestination,
    addCleanReport,
    resetDefaults,
  }
})
