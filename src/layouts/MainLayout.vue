<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="text-white q-py-xs" style="background-color: #7d9240 !important">
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title class="text-weight-bold"> Moya </q-toolbar-title>

        <q-space />

        <div class="row items-center q-gutter-x-sm q-px-sm">
          <q-avatar size="32px" class="bg-white text-weight-bold q-mr-xs" style="color: #7d9240">
            <q-icon name="person" size="20px" />
          </q-avatar>

          <div class="column text-left">
            <span class="text-subtitle2 text-weight-bold" style="line-height: 1.1">
              {{ userName }}
            </span>
            <span class="text-caption text-grey-3" style="font-size: 0.7rem;" v-if="userEmail">
              {{ userEmail }}
            </span>
          </div>
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered class="sidebar-drawer">
      <div class="column justify-between full-height">
        <div>
          <div
            class="q-px-xl q-py-md column items-center bg-grey-1"
            style="border-bottom: 1px solid rgba(0, 0, 0, 0.08)"
          >
            <img
              :src="logoImg"
              alt="Logo Moya"
              style="width: 100%; max-height: 80px; object-fit: contain"
              class="q-mb-xs"
            />
            <div
              class="text-subtitle1 text-weight-bold text-center"
              style="line-height: 1.2; color: #7d9240"
            >
              Mobility Voyage
            </div>
          </div>

          <q-list padding class="q-px-lg">
            <EssentialLink v-for="link in linksList" :key="link.title" v-bind="link" />
          </q-list>
        </div>

        <div class="q-pa-md">
          <q-btn
            outline
            no-caps
            color="primary"
            icon="logout"
            label="Logout"
            class="full-width text-weight-bold logout-btn"
            style="
              border-radius: 12px;
              justify-content: flex-start;
              padding: 10px 16px;
              border-width: 1.5px;
            "
            @click="showLogoutModal = true"
          />
        </div>
      </div>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
    <q-dialog v-model="showLogoutModal">
      <q-card style="width: 400px; max-width: 90vw" class="rounded-borders-lg q-pa-lg text-center">
        <div class="column items-center">
          <div class="logout-icon-wrapper q-mb-md">
            <q-icon name="logout" size="36px" color="primary" />
          </div>

          <h3 class="text-h6 text-weight-bold text-grey-9 q-ma-none q-mb-xs">Confirm Logout</h3>

          <p class="text-body2 text-grey-7 q-mb-lg font-dialog-message">
            Are you sure you want to log out from the Moya Admin System?
          </p>

          <div class="row justify-center q-gutter-x-sm full-width">
            <q-btn
              flat
              label="Cancel"
              no-caps
              color="grey-8"
              v-close-popup
              class="dialog-cancel-btn"
            />
            <q-btn
              color="primary"
              no-caps
              style="border-radius: 12px; padding: 8px 24px"
              label="Logout"
              icon="logout"
              class="text-weight-bold"
              :loading="isLoggingOut"
              @click="confirmLogout"
            />
          </div>
        </div>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/auth'
import EssentialLink from 'components/EssentialLink.vue'
import logoImg from 'assets/logo.png'

const router = useRouter()
const authStore = useAuthStore()
const leftDrawerOpen = ref(false)
const showLogoutModal = ref(false)
const isLoggingOut = ref(false)

const userName = computed(() => authStore.user?.name || 'Administrator')
const userEmail = computed(() => authStore.user?.email || '')

const linksList = [
  {
    title: 'Dashboard',
    icon: 'dashboard',
    link: '/admin/dashboard',
  },
  {
    title: 'Monitoring',
    icon: 'assessment',
    link: '/admin/monitoring',
  },
  {
    title: 'Destination',
    icon: 'place',
    link: '/admin/destination',
  },
  {
    title: 'Master Data',
    icon: 'storage',
    children: [
      {
        title: 'Facilities',
        icon: 'accessible',
        link: '/admin/master-data/accessibility',
      },
      {
        title: 'Tourism Type',
        icon: 'category',
        link: '/admin/master-data/tourism-type',
      },
      {
        title: 'User Rank',
        icon: 'emoji_events',
        link: '/admin/master-data/rank',
      },
    ],
  },
]

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

function confirmLogout() {
  showLogoutModal.value = false
  authStore.logout()
  router.push('/')
}
</script>

<style scoped lang="scss">
.full-height {
  height: 100%;
}

.logout-btn {
  border-color: #7d9240 !important;
  color: #7d9240 !important;
  transition: all 0.2s ease;

  &:hover {
    background-color: #f2f6e9 !important;
    border-color: #687b33 !important;
  }
}

.rounded-borders-lg {
  border-radius: 20px;
}

.logout-icon-wrapper {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background-color: #f2f6e9;
  border: 2px solid #c8d89c;
  display: flex;
  align-items: center;
  justify-content: center;
}

.font-dialog-message {
  line-height: 1.5;
  max-width: 320px;
}

.dialog-cancel-btn {
  border-radius: 12px;
}
</style>
