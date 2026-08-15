import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from 'boot/axios'

function decodeJwt(token) {
  try {
    const base64Url = token.split('.')[1]
    if (!base64Url) return null
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch {
    return null
  }
}

function extractUserRole(resData, userData, accessToken) {
  const jwtPayload = decodeJwt(accessToken)

  const rawRole =
    userData?.role ??
    userData?.role_name ??
    userData?.user_role ??
    userData?.role_id ??
    resData?.role ??
    resData?.user_role ??
    jwtPayload?.role ??
    jwtPayload?.user_role ??
    jwtPayload?.role_name ??
    jwtPayload?.role_id ??
    null

  if (rawRole !== null && rawRole !== undefined) {
    return String(rawRole).toLowerCase().trim()
  }
  return ''
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || '')
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))

  const isAuthenticated = computed(() => !!token.value)
  const userRole = computed(() => user.value?.role?.toLowerCase() || '')
  const isAdmin = computed(
    () => userRole.value === 'admin' || userRole.value === 'administrator' || userRole.value === '1'
  )

  async function login(email, password) {
    try {
      const response = await api.post('/auth/login', {
        email,
        password,
      })

      const resData = response.data

      // Support backend response structures
      const isSuccess =
        resData?.success === true ||
        resData?.status === 'success' ||
        !!resData?.user?.access_token ||
        !!resData?.access_token

      if (!isSuccess && resData?.message) {
        throw new Error(resData.message || 'Login failed. Please check your email and password.')
      }

      const userData = resData.user || resData.data || {}
      const accessToken = userData.access_token || resData.access_token || resData.token

      if (!accessToken) {
        throw new Error('Authentication token was not returned from the server.')
      }

      // Extract role from response object or JWT payload
      const detectedRole = extractUserRole(resData, userData, accessToken)

      // Strict Admin Role Verification
      const isUserAdmin =
        detectedRole === 'admin' ||
        detectedRole === 'administrator' ||
        detectedRole === '1'

      if (!isUserAdmin || detectedRole === 'user' || detectedRole === '2') {
        throw new Error(
          'Access Denied: Your account is a Mobile User account. This Web Portal is strictly for Administrators.'
        )
      }

      const finalRole = detectedRole || 'admin'

      // Save to state
      token.value = accessToken
      user.value = {
        ...userData,
        role: finalRole,
      }

      // Save to localStorage
      localStorage.setItem('token', accessToken)
      localStorage.setItem('user', JSON.stringify(user.value))

      return {
        success: true,
        message: resData.message || 'Login successful',
        user: user.value,
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        'An error occurred while connecting to the login server.'
      throw new Error(errorMsg)
    }
  }

  function logout() {
    token.value = ''
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  return {
    token,
    user,
    isAuthenticated,
    userRole,
    isAdmin,
    login,
    logout,
  }
})
