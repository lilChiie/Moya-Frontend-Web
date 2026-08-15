<template>
  <div class="login-page-wrapper">
    <!-- Center Login Card Container -->
    <div class="login-card-container">
      <!-- Left Hero Section (50%) -->
      <div class="hero-section">
        <div class="hero-content">
          <h1 class="welcome-text">Welcome To</h1>
          <div class="otw-wrapper">
            <img :src="otwImg" alt="OTW Illustration" class="otw-image" />
          </div>
          <div class="logo-wrapper">
            <img :src="logoImg" alt="MOYA Logo" class="brand-logo" />
          </div>
        </div>
      </div>

      <!-- Right Form Section (50%) -->
      <div class="form-section">
        <div class="form-wrapper">
          <h2 class="form-title">Login Admin!</h2>

          <form @submit.prevent="handleLogin" class="auth-form">
            <!-- Email Field -->
            <div class="form-group">
              <label for="email" class="form-label">Email</label>
              <div class="input-container" :class="{ 'has-error': emailError }">
                <input
                  id="email"
                  v-model.trim="email"
                  type="email"
                  placeholder="Insert Email"
                  autocomplete="email"
                  required
                  class="custom-input"
                  @input="emailError = ''"
                />
              </div>
              <span v-if="emailError" class="error-message">{{ emailError }}</span>
            </div>

            <!-- Password Field -->
            <div class="form-group">
              <label for="password" class="form-label">Password</label>
              <div class="input-container password-input-container" :class="{ 'has-error': passwordError }">
                <input
                  id="password"
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Insert Password"
                  autocomplete="current-password"
                  required
                  class="custom-input password-input"
                  @input="passwordError = ''"
                />
                <button
                  type="button"
                  class="password-toggle-btn"
                  :aria-label="showPassword ? 'Sembunyikan password' : 'Tampilkan password'"
                  @click="showPassword = !showPassword"
                >
                  <q-icon :name="showPassword ? 'visibility_off' : 'visibility'" size="20px" />
                </button>
              </div>
              <span v-if="passwordError" class="error-message">{{ passwordError }}</span>
            </div>

            <!-- Login Button -->
            <button
              type="submit"
              class="login-btn"
              :disabled="isLoading"
            >
              <q-spinner-dots v-if="isLoading" color="white" size="24px" />
              <span v-else>Login</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import logoImg from 'assets/logo.png'
import otwImg from 'assets/otw.png'

const router = useRouter()
const $q = useQuasar()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const isLoading = ref(false)
const emailError = ref('')
const passwordError = ref('')

const handleLogin = async () => {
  emailError.value = ''
  passwordError.value = ''

  if (!email.value) {
    emailError.value = 'Email wajib diisi'
    return
  }

  if (!password.value) {
    passwordError.value = 'Password wajib diisi'
    return
  }

  isLoading.value = true

  try {
    // Simulasi autentikasi
    await new Promise((resolve) => setTimeout(resolve, 600))

    if ($q.notify) {
      $q.notify({
        type: 'positive',
        message: 'Berhasil login! Selamat datang Admin.',
        position: 'top',
        timeout: 2000,
      })
    }

    router.push('/dashboard')
  } catch (error) {
    console.error('Login error:', error)
    if ($q.notify) {
      $q.notify({
        type: 'negative',
        message: 'Gagal login. Silakan periksa kembali data Anda.',
        position: 'top',
      })
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
/* Background Halaman Seluruh Layar */
.login-page-wrapper {
  min-height: 100vh;
  width: 100%;
  background-color: #edf2e8;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1.5rem;
  box-sizing: border-box;
  overflow-x: hidden;
}

/* Card Container di Tengah Layar */
.login-card-container {
  width: 92%;
  max-width: 960px;
  min-height: 560px;
  background-color: #ffffff;
  border-radius: 18px;
  box-shadow: 0 20px 45px -10px rgba(0, 0, 0, 0.12), 0 8px 16px -4px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  display: flex;
  flex-direction: row;
  align-items: stretch;
}

/* Panel Kiri (Hero Section) ~50% */
.hero-section {
  flex: 1;
  background-color: #ccd7b8;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2.5rem 2rem;
  box-sizing: border-box;
}

.hero-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  width: 100%;
  max-width: 360px;
}

.welcome-text {
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 2.15rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 1.25rem 0;
  letter-spacing: 0.3px;
  line-height: 1.2;
}

.otw-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: 1.25rem;
}

.otw-image {
  max-width: 220px;
  max-height: 140px;
  width: auto;
  height: auto;
  object-fit: contain;
}

.logo-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
}

.brand-logo {
  max-width: 210px;
  max-height: 80px;
  width: auto;
  height: auto;
  object-fit: contain;
}

/* Panel Kanan (Form Section) ~50% */
.form-section {
  flex: 1;
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2.5rem 2.5rem;
  box-sizing: border-box;
}

.form-wrapper {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: 100%;
  max-width: 360px;
}

.form-title {
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 1.95rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 1.75rem 0;
  text-align: center;
  letter-spacing: -0.3px;
}

.auth-form {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 1.25rem;
}

.form-label {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 0.925rem;
  font-weight: 500;
  color: #27272a;
  margin-bottom: 0.45rem;
  text-align: left;
}

.input-container {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.custom-input {
  width: 100%;
  height: 46px;
  padding: 0.7rem 0.9rem;
  font-size: 0.95rem;
  font-family: inherit;
  color: #1f2937;
  background-color: #ffffff;
  border: 1.5px solid #7d9240;
  border-radius: 4px;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}

.custom-input::placeholder {
  font-style: italic;
  color: #9ca3af;
  font-weight: 400;
}

.custom-input:focus {
  border-color: #687b32;
  box-shadow: 0 0 0 3px rgba(125, 146, 64, 0.2);
}

.password-input-container {
  position: relative;
}

.password-input {
  padding-right: 2.75rem;
}

.password-toggle-btn {
  position: absolute;
  right: 0.75rem;
  background: transparent;
  border: none;
  color: #71717a;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 4px;
  transition: color 0.2s;
}

.password-toggle-btn:hover {
  color: #27272a;
}

.has-error .custom-input {
  border-color: #ef4444 !important;
}

.error-message {
  font-size: 0.8rem;
  color: #ef4444;
  margin-top: 0.35rem;
  text-align: left;
}

/* Submit Button */
.login-btn {
  margin-top: 0.85rem;
  width: 100%;
  height: 46px;
  background-color: #a3bd63;
  color: #ffffff;
  font-family: inherit;
  font-size: 1.05rem;
  font-weight: 700;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
  transition: background-color 0.2s, transform 0.1s, box-shadow 0.2s;
}

.login-btn:hover:not(:disabled) {
  background-color: #92ab50;
  box-shadow: 0 4px 10px rgba(146, 171, 80, 0.3);
  transform: translateY(-1px);
}

.login-btn:active:not(:disabled) {
  transform: translateY(0);
}

.login-btn:disabled {
  opacity: 0.75;
  cursor: not-allowed;
}

/* Responsive Breakpoints (Tablet & Mobile) */
@media (max-width: 860px) {
  .login-page-wrapper {
    padding: 1.5rem 1rem;
  }

  .login-card-container {
    flex-direction: column;
    min-height: auto;
    max-width: 480px;
    width: 100%;
    border-radius: 16px;
  }

  .hero-section {
    flex: none;
    padding: 2.25rem 1.5rem 1.75rem;
  }

  .welcome-text {
    font-size: 1.85rem;
    margin-bottom: 0.9rem;
  }

  .otw-image {
    max-width: 180px;
    max-height: 120px;
  }

  .brand-logo {
    max-width: 175px;
    max-height: 65px;
  }

  .form-section {
    flex: none;
    padding: 2rem 1.5rem 2.25rem;
  }

  .form-title {
    font-size: 1.7rem;
    margin-bottom: 1.35rem;
  }
}

@media (max-width: 480px) {
  .login-page-wrapper {
    padding: 1rem 0.75rem;
  }

  .login-card-container {
    border-radius: 14px;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  }

  .hero-section {
    padding: 1.75rem 1rem 1.25rem;
  }

  .welcome-text {
    font-size: 1.6rem;
    margin-bottom: 0.75rem;
  }

  .otw-image {
    max-width: 150px;
  }

  .brand-logo {
    max-width: 150px;
  }

  .form-section {
    padding: 1.5rem 1.25rem 2rem;
  }

  .form-title {
    font-size: 1.5rem;
    margin-bottom: 1.15rem;
  }

  .custom-input {
    height: 44px;
  }

  .login-btn {
    height: 44px;
    font-size: 1rem;
  }
}
</style>
