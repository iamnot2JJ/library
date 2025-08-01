<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="card shadow">
          <div class="card-header bg-primary text-white text-center">
            <h2 class="mb-0">🔐 System Login</h2>
          </div>
          <div class="card-body">
            <form @submit.prevent="handleLogin">
              <div class="mb-3">
                <label class="form-label">Username</label>
                <input 
                  v-model="username" 
                  class="form-control" 
                  :class="{ 'is-invalid': error }"
                  required 
                  autocomplete="username"
                />
              </div>
              
              <div class="mb-3">
                <label class="form-label">Password</label>
                <div class="input-group">
                  <input 
                    v-model="password" 
                    :type="showPassword ? 'text' : 'password'" 
                    class="form-control" 
                    :class="{ 'is-invalid': error }"
                    required 
                    autocomplete="current-password"
                  />
                  <button 
                    type="button" 
                    class="btn btn-outline-secondary"
                    @click="showPassword = !showPassword"
                  >
                    <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                class="btn btn-primary w-100" 
                :disabled="loading"
              >
                <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                {{ loading ? 'Logging in...' : 'Login' }}
              </button>
              
              <div class="text-danger mt-2" v-if="error">
                <i class="bi bi-exclamation-triangle me-2"></i>{{ error }}
              </div>
            </form>
          </div>
        </div>

        <div class="card mt-4">
          <div class="card-header bg-info text-white">
            <h6 class="mb-0">🧪 Accounts</h6>
          </div>
          <div class="card-body">
            <div class="row">
              <div v-for="user in testUsers" :key="user.username" class="col-md-6 mb-2">
                <div class="border rounded p-2">
                  <div class="d-flex justify-content-between align-items-center">
                    <div>
                      <strong>{{ user.role }}</strong><br>
                      <small class="text-muted">{{ user.username }}/{{ user.password }}</small>
                    </div>
                    <button 
                      @click="Login(user.username, user.password)"
                      class="btn btn-sm btn-outline-primary"
                      :disabled="loading"
                    >
                     Login
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="alert alert-warning mt-3 mb-0">
              <small>
                <i class="bi bi-info-circle me-2"></i>
                Choose your role
              </small>
            </div>
          </div>
        </div>


        <div class="card mt-4">
          <div class="card-header bg-success text-white">
            <h6 class="mb-0">👥 Role Descriptions</h6>
          </div>
          <div class="card-body">
            <div class="row">
              <div v-for="role in availableRoles" :key="role.role" class="col-12 mb-2">
                <div class="d-flex align-items-center">
                  <span class="badge me-2" :class="getRoleBadgeClass(role.role)">
                    {{ role.label }}
                  </span>
                  <small class="text-muted">{{ role.description }}</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { login, getTestUsers, getAvailableRoles } from '../auth'
import { useRouter } from 'vue-router'

const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
const showPassword = ref(false)
const testUsers = ref([])
const availableRoles = ref([])
const router = useRouter()

onMounted(() => {
  testUsers.value = getTestUsers()
  availableRoles.value = getAvailableRoles()
})

const handleLogin = async () => {
  if (!username.value || !password.value) {
    error.value = 'Please enter both username and password'
    return
  }

  try {
    loading.value = true
    error.value = ''
    
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    if (login(username.value, password.value)) {
      // 登录成功，根据来源页面决定跳转
      const redirect = router.currentRoute.value.query.redirect || '/about'
      router.push(redirect)
    } else {
      error.value = 'Invalid username or password'
      
      // 清空密码字段
      password.value = ''
      
      // 3秒后清除错误信息
      setTimeout(() => {
        error.value = ''
      }, 3000)
    }
  } catch (err) {
    error.value = 'Login failed. Please try again.'
    console.error('Login error:', err)
  } finally {
    loading.value = false
  }
}

const Login = (user, pass) => {
  username.value = user
  password.value = pass
  handleLogin()
}

const getRoleBadgeClass = (role) => {
  const classes = {
    admin: 'bg-danger',
    librarian: 'bg-warning text-dark',
    staff: 'bg-info text-dark',
    student: 'bg-primary',
    member: 'bg-secondary'
  }
  return classes[role] || 'bg-secondary'
}
</script>

<style scoped>
.card {
  border-radius: 15px;
}

.card-header {
  border-radius: 15px 15px 0 0 !important;
}

.btn {
  border-radius: 8px;
}

.input-group .btn {
  border-radius: 0 8px 8px 0;
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}

.alert {
  border-radius: 8px;
}

.border {
  border-radius: 8px;
}

.badge {
  font-size: 0.75rem;
  min-width: 80px;
  text-align: center;
}
</style>