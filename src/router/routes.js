const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/DashboardPage.vue') },
      { path: 'dashboard', component: () => import('pages/DashboardPage.vue') },
      { path: 'monitoring', component: () => import('pages/MonitoringPage.vue') },
      { path: 'destination', component: () => import('pages/DestinationPage.vue') },
      { path: 'master-data/accessibility', component: () => import('pages/AccessibilityPage.vue') },
      { path: 'master-data/tourism-type', component: () => import('pages/TourismTypePage.vue') },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
