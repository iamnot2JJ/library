import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AboutView from '../views/AboutView.vue'
import LoginView from '../views/LoginView.vue'
import ForbiddenView from '../views/ForbiddenView.vue'
import { isAuthenticated } from '../auth'

const routes = [
  { path: '/', component: HomeView },
  {
    path: '/about',
    component: AboutView,
    meta: { requiresAuth: true }
  },
  { path: '/login', component: LoginView },
  { path: '/forbidden', component: ForbiddenView }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !isAuthenticated.value) {
    next('/forbidden')
  } else {
    next()
  }
})

export default router
