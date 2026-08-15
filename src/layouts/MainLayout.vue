<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-primary text-white q-py-xs">
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title class="text-weight-bold"> Moya </q-toolbar-title>

        <q-space />

        <div class="row items-center q-gutter-x-sm q-px-sm">
          <q-avatar size="32px" class="bg-white text-primary text-weight-bold q-mr-xs">
            <q-icon name="person" size="20px" />
          </q-avatar>

          <div class="column text-left">
            <span class="text-subtitle2 text-weight-bold" style="line-height: 1.1;">Administrator</span>
          </div>
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <div class="q-px-xl q-py-md column items-center bg-grey-1" style="border-bottom: 1px solid rgba(0, 0, 0, 0.08)">
        <img :src="logoImg" alt="Logo Moya" style="width: 100%; max-height: 80px; object-fit: contain;" class="q-mb-xs" />
        <div class="text-subtitle1 text-weight-bold text-primary text-center" style="line-height: 1.2;">Mobility Voyage</div>
      </div>

      <q-list padding class="q-px-lg">
        <EssentialLink v-for="link in linksList" :key="link.title" v-bind="link" />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import EssentialLink from 'components/EssentialLink.vue'
import logoImg from 'assets/logo.png'

const linksList = [
  {
    title: 'Dashboard',
    icon: 'dashboard',
    link: '/dashboard',
  },
  {
    title: 'Monitoring',
    icon: 'assessment',
    link: '/monitoring',
  },
  {
    title: 'Destination',
    icon: 'place',
    link: '/destination',
  },
  {
    title: 'Master Data',
    icon: 'storage',
    children: [
      {
        title: 'Accessibility',
        icon: 'accessible',
        link: '/master-data/accessibility',
      },
      {
        title: 'Tourism Type',
        icon: 'category',
        link: '/master-data/tourism-type',
      },
    ],
  },
]

const leftDrawerOpen = ref(false)

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}
</script>
