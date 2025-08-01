import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AboutView from '../views/AboutView.vue'
import LoginView from '../views/LoginView.vue'
import LogoutView from '../views/LogoutView.vue'
import ForbiddenView from '../views/ForbiddenView.vue'
import FirebaseSigninView from '@/views/FirebaseSigninView.vue'
import FirebaseRegisterView from '@/views/FirebaseRegisterView.vue'
import AddBookView from '../views/AddBookView.vue'
import WeatherView from '../views/WeatherView.vue'
import CountBookAPI from '../views/CountBookAPI.vue'
import GetAllBooksAPI from '../views/GetAllBooksAPI.vue'
import { isAuthenticated } from '../auth'

const routes = [
  { 
    path: '/', 
    component: HomeView 
  },
  {
    path: '/about',
    component: AboutView,
    meta: { requiresAuth: true }
  },
  { 
    path: '/login', 
    component: LoginView 
  },
  { 
    path: '/logout', 
    component: LogoutView 
  },
  { 
    path: '/forbidden', 
    component: ForbiddenView 
  },
  {
    path: '/FireLogin',
    name: 'FireLogin',
    component: FirebaseSigninView
  },
  {
    path: '/FireRegister',
    name: 'FireRegister',
    component: FirebaseRegisterView
  },
  {
    path: '/addbook',
    name: 'AddBook',
    component: AddBookView
  },
  {
    path: '/WeatherCheck',
    name: 'GetWeather',
    component: WeatherView
  },
  {
    path: '/CountBookAPI',
    name: 'CountBookAPI',
    component: CountBookAPI
  },
  {
    path: '/GetAllBookAPI',
    name: 'GetAllBookAPI', 
    component: GetAllBooksAPI
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !isAuthenticated.value) {
    // 保存原始目标路径，以便登录后跳转回来
    next(`/forbidden?redirect=${to.path}`)
  } else {
    next()
  }
})

export default router