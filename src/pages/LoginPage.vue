<template>
  <div class="login-page-wrapper">
    <div class="login-card-container">
      <div class="hero-section">
        <div class="hero-content">
          <div class="welcome-badge">
            <q-icon name="explore" size="14px" class="q-mr-xs" />
            Batam Tourism Portal
          </div>
          <h1 class="welcome-text">Welcome To</h1>
          <div class="otw-wrapper">
            <img :src="otwImg" alt="OTW Illustration" class="otw-image" />
          </div>
          <div class="logo-wrapper">
            <img :src="logoImg" alt="MOYA Logo" class="brand-logo" />
          </div>
        </div>
      </div>

      <div class="form-section">
        <div class="form-wrapper">
          <div class="form-header-container">
            <img :src="logo1Img" alt="MOYA Logo" class="form-logo-img q-mb-sm" />
            <h2 class="form-title">Admin Login</h2>
            <p class="form-subtitle">
              Sign in to access destination & cleanliness management
            </p>
          </div>

          <q-form @submit.prevent="handleLogin" class="auth-form">
            <div class="form-group">
              <label for="email" class="form-label">Email</label>
              <q-input
                id="email"
                v-model.trim="email"
                type="email"
                placeholder="Enter Email"
                outlined
                dense
                bg-color="white"
                class="rounded-field"
                :error="!!emailError"
                :error-message="emailError"
                hide-bottom-space
                @update:model-value="emailError = ''"
              >
                <template #prepend>
                  <q-icon name="email" color="primary" />
                </template>
              </q-input>
            </div>

            <div class="form-group q-mt-sm">
              <label for="password" class="form-label">Password</label>
              <q-input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Enter Password"
                outlined
                dense
                bg-color="white"
                class="rounded-field"
                :error="!!passwordError"
                :error-message="passwordError"
                hide-bottom-space
                @update:model-value="passwordError = ''"
              >
                <template #prepend>
                  <q-icon name="lock" color="primary" />
                </template>
                <template #append>
                  <q-icon
                    :name="showPassword ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer"
                    color="grey-7"
                    @click="showPassword = !showPassword"
                  />
                </template>
              </q-input>
            </div>

            <q-btn
              type="submit"
              color="primary"
              no-caps
              label="Login"
              class="login-btn full-width text-weight-bold q-mt-lg"
              style="border-radius: 12px; height: 46px; font-size: 1rem;"
              :loading="isLoading"
            />
          </q-form>
        </div>
      </div>
    </div>
    
    <StatusDialog
      v-model="showSuccessModal"
      type="success"
      title="Login Successful!"
      message="Congratulations! You have successfully logged in. Redirecting to Dashboard..."
      @confirm="redirectToDashboard"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import StatusDialog from 'components/StatusDialog.vue'
import logoImg from 'assets/logo.png'
import logo1Img from 'assets/logo_1.png'
import otwImg from 'assets/otw.png'

const router = useRouter()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const isLoading = ref(false)
const emailError = ref('')
const passwordError = ref('')
const showSuccessModal = ref(false)

const handleLogin = async () => {
  emailError.value = ''
  passwordError.value = ''

  if (!email.value) {
    emailError.value = 'Email is required'
    return
  }

  if (!password.value) {
    passwordError.value = 'Password is required'
    return
  }

  isLoading.value = true

  try {
    await new Promise((resolve) => setTimeout(resolve, 500))
    showSuccessModal.value = true
  } catch (error) {
    console.error('Login error:', error)
  } finally {
    isLoading.value = false
  }
}

function redirectToDashboard() {
  router.push('/admin/dashboard')
}
</script>

<style scoped>
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

.welcome-badge {
  display: inline-flex;
  align-items: center;
  background-color: #ffffff;
  color: #7d9240;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 20px;
  margin-bottom: 0.75rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8d8;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.welcome-text {
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 2.2rem;
  font-weight: 800;
  color: #2c331b;
  margin: 0 0 1rem 0;
  letter-spacing: -0.5px;
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

.form-header-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: 1.5rem;
}

.form-logo-img {
  max-height: 54px;
  width: auto;
  object-fit: contain;
  margin-bottom: 0.5rem;
}

.form-title {
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 1.8rem;
  font-weight: 800;
  color: #111827;
  margin: 0 0 0.25rem 0;
  letter-spacing: -0.5px;
}

.form-subtitle {
  font-size: 0.85rem;
  color: #6b7280;
  margin: 0;
  line-height: 1.4;
}

.auth-form {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 0.75rem;
}

.form-label {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 0.925rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.35rem;
  text-align: left;
}

:deep(.q-field__control) {
  border-radius: 12px !important;
}

.login-btn {
  background-color: #7d9240 !important;
  color: #ffffff !important;
  box-shadow: 0 4px 14px rgba(125, 146, 64, 0.3);
  transition: all 0.2s ease;

  &:hover {
    background-color: #687b33 !important;
  }
}

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

  .login-btn {
    height: 44px;
    font-size: 1rem;
  }
}
</style>
