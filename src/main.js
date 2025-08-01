import 'bootstrap/dist/css/bootstrap.min.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'

const app = createApp(App)

// 注册 PrimeVue
app.use(PrimeVue, { theme: { preset: Aura } })

// 注册路由
app.use(router)

app.mount('#app')