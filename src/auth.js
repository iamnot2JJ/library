import { ref } from 'vue'

export const isAuthenticated = ref(false)

export const login = (username, password) => {
  // ✅ 硬编码的用户名密码
  if (username === 'admin' && password === 'password') {
    isAuthenticated.value = true
    return true
  }
  return false
}

export const logout = () => {
  isAuthenticated.value = false
}
