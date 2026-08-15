import { defineRouter } from '#q-app/wrappers'
import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory,
} from 'vue-router'
import routes from './routes'

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  })

  // Strict Navigation Guard: Restrict ALL pages except Login ('/')
  Router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token')
    const user = JSON.parse(localStorage.getItem('user') || 'null')
    const isAuth = !!token
    const role = user?.role ? String(user.role).toLowerCase() : 'admin'
    const isAdmin = role === 'admin'

    const isLoginPage = to.path === '/'

    if (!isLoginPage) {
      // Trying to access any protected page (Dashboard, Destination, Monitoring, etc.)
      if (!isAuth || !isAdmin) {
        if (isAuth && !isAdmin) {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
        }
        return next('/')
      }
    } else {
      // Trying to access Login page while already logged in as Admin
      if (isAuth && isAdmin) {
        return next('/admin/dashboard')
      }
    }

    next()
  })

  return Router
})
