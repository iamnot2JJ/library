<template>
  <div class="container mt-5">
    <h2 class="text-center">Login</h2>
    <form @submit.prevent="handleLogin" class="col-md-6 offset-md-3">
      <div class="mb-3">
        <label class="form-label">Username</label>
        <input v-model="username" class="form-control" required />
      </div>
      <div class="mb-3">
        <label class="form-label">Password</label>
        <input v-model="password" type="password" class="form-control" required />
      </div>
      <button type="submit" class="btn btn-primary w-100">Login</button>
      <div class="text-danger mt-2" v-if="error">{{ error }}</div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { login } from '../auth'
import { useRouter } from 'vue-router'

const username = ref('')
const password = ref('')
const error = ref(null)
const router = useRouter()

const handleLogin = () => {
  if (login(username.value, password.value)) {
    router.push('/about') // 登录成功，跳转到受限页面
  } else {
    error.value = 'Invalid credentials'
  }
}
</script>
