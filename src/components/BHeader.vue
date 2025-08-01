<template>
  <div class="container">
    <header class="d-flex justify-content-between align-items-center py-3">
      <ul class="nav nav-pills">
        <li class="nav-item">
          <router-link to="/" class="nav-link" active-class="active" aria-current="page">
            Home (Week 5)
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/about" class="nav-link" active-class="active">
            About
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/addbook" class="nav-link" active-class="active">
            Add Book
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/WeatherCheck" class="nav-link" active-class="active">
            Get Weather
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/CountBookAPI" class="nav-link" active-class="active">
            Count Book API
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/GetAllBookAPI" class="nav-link" active-class="active">
            Get All Books API
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/FireLogin" class="nav-link" active-class="active">
            Firebase Login
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/FireRegister" class="nav-link" active-class="active">
            Firebase Register
          </router-link>
        </li>
      </ul>

      <!-- 用户信息和登录/登出按钮 -->
      <div class="d-flex align-items-center">
        <!-- 显示当前用户信息 -->
        <div v-if="isAuthenticated && currentUser" class="me-3">
          <span class="text-muted me-2">Welcome,</span>
          <span class="fw-bold">{{ currentUser.displayName }}</span>
          <span class="badge ms-2" :class="getRoleBadgeClass(currentUser.role)">
            {{ currentUser.role }}
          </span>
        </div>

        <!-- 登录/登出按钮组 -->
        <div>
          <template v-if="isAuthenticated">
            <!-- Logout 按钮 -->
            <router-link to="/logout" class="btn btn-outline-warning me-2">
              <i class="bi bi-box-arrow-right me-1"></i>
              Logout
            </router-link>
            <!-- 快速登出按钮 -->
            <button
              class="btn btn-outline-danger"
              @click="handleQuickLogout"
            >
              <i class="bi bi-power me-1"></i>
              Quick Logout
            </button>
          </template>
          <template v-else>
            <router-link to="/login" class="btn btn-outline-primary">
              <i class="bi bi-box-arrow-in-right me-1"></i>
              Login
            </router-link>
          </template>
        </div>
      </div>
    </header>
  </div>
</template>

<script setup>
import { isAuthenticated, logout, currentUser, initializeAuth } from '../auth'
import { useRouter } from 'vue-router'
import { onMounted } from 'vue'

const router = useRouter()

onMounted(() => {
  // 初始化认证状态
  initializeAuth()
})

const handleQuickLogout = () => {
  if (confirm('Are you sure you want to logout immediately?')) {
    logout()
    router.push('/login')
  }
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
.b-example-divider {
  height: 3rem;
  background-color: rgba(0, 0, 0, 0.1);
  border: solid rgba(0, 0, 0, 0.15);
  border-width: 1px 0;
  box-shadow:
    inset 0 0.5em 1.5em rgba(0, 0, 0, 0.1),
    inset 0 0.125em 0.5em rgba(0, 0, 0, 0.15);
}

.form-control-dark {
  color: #fff;
  background-color: var(--bs-dark);
  border-color: var(--bs-gray);
}
.form-control-dark:focus {
  color: #fff;
  background-color: var(--bs-dark);
  border-color: #fff;
  box-shadow: 0 0 0 0.25rem rgba(255, 255, 255, 0.25);
}

.bi {
  vertical-align: -0.125em;
  fill: currentColor;
}

.text-small {
  font-size: 85%;
}

.dropdown-toggle {
  outline: 0;
}

.badge {
  font-size: 0.7rem;
  font-weight: 500;
}

/* Navigation responsiveness */
@media (max-width: 1200px) {
  .nav {
    flex-wrap: wrap;
  }
  
  .nav-pills .nav-link {
    padding: 0.375rem 0.5rem;
    font-size: 0.9rem;
  }
}

@media (max-width: 768px) {
  header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .nav {
    justify-content: center;
    margin-bottom: 1rem;
  }
  
  .nav-pills .nav-link {
    padding: 0.25rem 0.4rem;
    font-size: 0.8rem;
    margin: 0.1rem;
  }
}
</style>