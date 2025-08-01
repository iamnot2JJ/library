<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-8">
        
        <!-- 如果用户已登录，显示退出确认 -->
        <div v-if="currentUser && !loggedOut" class="card shadow">
          <div class="card-header bg-warning text-dark text-center">
            <h2 class="mb-0">🚪 Logout Confirmation</h2>
          </div>
          <div class="card-body">
            
            <!-- 当前用户信息 -->
            <div class="alert alert-info">
              <h5 class="alert-heading">📊 Current Session Information</h5>
              <div class="row">
                <div class="col-md-6">
                  <p class="mb-1"><strong>User:</strong> {{ currentUser.displayName }}</p>
                  <p class="mb-1"><strong>Username:</strong> {{ currentUser.username }}</p>
                  <p class="mb-1"><strong>Email:</strong> {{ currentUser.email }}</p>
                </div>
                <div class="col-md-6">
                  <p class="mb-1">
                    <strong>Role:</strong> 
                    <span class="badge ms-2" :class="getRoleBadgeClass(currentUser.role)">
                      {{ getRoleLabel(currentUser.role) }}
                    </span>
                  </p>
                  <p class="mb-1"><strong>Department:</strong> {{ currentUser.department }}</p>
                  <p class="mb-0"><strong>Session ID:</strong> {{ currentUser.sessionId }}</p>
                </div>
              </div>
            </div>

            <!-- 开发者控制台 -->
            <div class="card border-dark mb-4">
              <div class="card-header bg-dark text-white d-flex justify-content-between align-items-center">
                <h6 class="mb-0">🖥️ Developer Console</h6>
                <button 
                  @click="toggleConsole" 
                  class="btn btn-sm btn-outline-light"
                >
                  {{ showConsole ? 'Hide' : 'Show' }} Console
                </button>
              </div>
              <div v-show="showConsole" class="card-body bg-dark text-light" style="font-family: 'Courier New', monospace;">
                <div class="console-output" ref="consoleOutput">
                  <div v-for="(log, index) in consoleLogs" :key="index" class="console-line">
                    <span class="text-muted">{{ log.timestamp }}</span>
                    <span :class="getLogClass(log.type)">{{ log.type.toUpperCase() }}:</span>
                    <span>{{ log.message }}</span>
                  </div>
                </div>
                
                <div class="console-controls mt-3">
                  <button @click="clearConsole" class="btn btn-sm btn-outline-light me-2">
                    Clear Console
                  </button>
                  <button @click="exportLogs" class="btn btn-sm btn-outline-light me-2">
                    Export Logs
                  </button>
                  <button @click="addTestLog" class="btn btn-sm btn-outline-light">
                    Add Test Log
                  </button>
                </div>
              </div>
            </div>

            <!-- 用户权限和会话详情 -->
            <div class="row mb-4">
              <div class="col-md-6">
                <div class="card border-primary">
                  <div class="card-header bg-primary text-white">
                    <h6 class="mb-0">🔑 Permissions</h6>
                  </div>
                  <div class="card-body">
                    <div v-for="permission in currentUser.permissions" :key="permission" class="mb-1">
                      <span class="badge bg-success me-2">✓</span>
                      {{ formatPermission(permission) }}
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="col-md-6">
                <div class="card border-info">
                  <div class="card-header bg-info text-white">
                    <h6 class="mb-0">⏱️ Session Details</h6>
                  </div>
                  <div class="card-body">
                    <p class="mb-1"><strong>Login Time:</strong> {{ formatTime(currentUser.loginTime) }}</p>
                    <p class="mb-1"><strong>Session Duration:</strong> {{ sessionDuration }}</p>
                    <p class="mb-1"><strong>Last Activity:</strong> {{ formatTime(currentTime) }}</p>
                    <p class="mb-0"><strong>Browser:</strong> {{ browserInfo }}</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="my-4 text-center">
              <i class="bi bi-question-circle text-warning" style="font-size: 3rem;"></i>
              <h4 class="mt-3">Are you sure you want to logout?</h4>
              <p class="text-muted">Your session will be terminated and logged to the console.</p>
            </div>

            <!-- 退出按钮组 -->
            <div class="d-flex gap-3 justify-content-center">
              <button 
                @click="confirmLogout" 
                class="btn btn-danger btn-lg"
                :disabled="loading"
              >
                <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"></span>
                <i class="bi bi-box-arrow-right me-2"></i>
                {{ loading ? 'Logging out...' : 'Yes, Logout' }}
              </button>
              
              <button 
                @click="cancelLogout" 
                class="btn btn-secondary btn-lg"
                :disabled="loading"
              >
                <i class="bi bi-arrow-left me-2"></i>
                Cancel
              </button>
            </div>
          </div>
        </div>

        <!-- 退出成功信息 -->
        <div v-else-if="loggedOut" class="card shadow border-success">
          <div class="card-header bg-success text-white text-center">
            <h2 class="mb-0">✅ Logged Out Successfully</h2>
          </div>
          <div class="card-body text-center">
            <div class="my-4">
              <i class="bi bi-check-circle text-success" style="font-size: 3rem;"></i>
              <h4 class="mt-3 text-success">Session Terminated</h4>
              <p class="text-muted">Thank you for using our library system!</p>
            </div>

            <div class="alert alert-success">
              <p class="mb-0">
                <i class="bi bi-info-circle me-2"></i>
                Your session has been terminated securely. Check the developer console for session logs.
              </p>
            </div>

            <!-- 控制台最终日志 -->
            <div v-if="finalLogs.length" class="card border-dark mt-3">
              <div class="card-header bg-dark text-white">
                <h6 class="mb-0">📋 Final Session Logs</h6>
              </div>
              <div class="card-body bg-dark text-light" style="font-family: 'Courier New', monospace; font-size: 0.8rem;">
                <div v-for="(log, index) in finalLogs" :key="index" class="console-line">
                  <span class="text-muted">{{ log.timestamp }}</span>
                  <span :class="getLogClass(log.type)">{{ log.type.toUpperCase() }}:</span>
                  <span>{{ log.message }}</span>
                </div>
              </div>
            </div>

            <!-- 重新登录或返回首页按钮 -->
            <div class="d-flex gap-3 justify-content-center mt-4">
              <router-link to="/login" class="btn btn-primary btn-lg">
                <i class="bi bi-box-arrow-in-right me-2"></i>
                Login Again
              </router-link>
              
              <router-link to="/" class="btn btn-outline-primary btn-lg">
                <i class="bi bi-house me-2"></i>
                Go to Home
              </router-link>
            </div>
          </div>
        </div>

        <!-- 如果用户未登录 -->
        <div v-else class="card shadow border-info">
          <div class="card-header bg-info text-white text-center">
            <h2 class="mb-0">ℹ️ Not Logged In</h2>
          </div>
          <div class="card-body text-center">
            <div class="my-4">
              <i class="bi bi-person-x text-info" style="font-size: 3rem;"></i>
              <h4 class="mt-3">You are not currently logged in</h4>
              <p class="text-muted">Please login first to access the system.</p>
            </div>

            <div class="d-flex gap-3 justify-content-center">
              <router-link to="/login" class="btn btn-primary btn-lg">
                <i class="bi bi-box-arrow-in-right me-2"></i>
                Go to Login
              </router-link>
              
              <router-link to="/" class="btn btn-outline-primary btn-lg">
                <i class="bi bi-house me-2"></i>
                Go to Home
              </router-link>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { logout, currentUser, initializeAuth } from '../auth'
import { useRouter } from 'vue-router'

const loading = ref(false)
const loggedOut = ref(false)
const showConsole = ref(true)
const consoleLogs = ref([])
const finalLogs = ref([])
const currentTime = ref(new Date())
const consoleOutput = ref(null)
const router = useRouter()

// 定时器
let timeInterval = null

onMounted(() => {
  // 初始化认证状态
  initializeAuth()
  
  // 添加初始控制台日志
  addConsoleLog('info', 'Logout page loaded')
  
  if (currentUser.value) {
    addConsoleLog('info', `Current user: ${currentUser.value.displayName} (${currentUser.value.role})`)
    addConsoleLog('info', `Session ID: ${currentUser.value.sessionId}`)
  }
  
  // 启动时间更新
  timeInterval = setInterval(() => {
    currentTime.value = new Date()
  }, 1000)
  
  // 拦截 console.log
  interceptConsole()
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})

const sessionDuration = computed(() => {
  if (!currentUser.value?.loginTime) return 'Unknown'
  
  const loginTime = new Date(currentUser.value.loginTime)
  const now = currentTime.value
  const duration = Math.floor((now - loginTime) / 1000)
  
  const hours = Math.floor(duration / 3600)
  const minutes = Math.floor((duration % 3600) / 60)
  const seconds = duration % 60
  
  return `${hours}h ${minutes}m ${seconds}s`
})

const browserInfo = computed(() => {
  return navigator.userAgent.split(' ')[0] || 'Unknown'
})

const confirmLogout = async () => {
  try {
    loading.value = true
    
    addConsoleLog('warn', 'Logout process initiated')
    addConsoleLog('info', `Session duration: ${sessionDuration.value}`)
    
    // 模拟退出延迟
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // 保存最终日志
    finalLogs.value = [...consoleLogs.value]
    
    // 执行退出登录
    logout()
    
    addConsoleLog('success', 'User logged out successfully')
    addConsoleLog('info', 'Session terminated')
    
    // 显示退出成功状态
    loggedOut.value = true
    
  } catch (error) {
    console.error('Logout error:', error)
    addConsoleLog('error', 'Logout failed: ' + error.message)
  } finally {
    loading.value = false
  }
}

const cancelLogout = () => {
  addConsoleLog('info', 'Logout cancelled by user')
  
  // 返回到上一页或首页
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}

const addConsoleLog = (type, message) => {
  const timestamp = new Date().toLocaleTimeString()
  consoleLogs.value.push({
    timestamp,
    type,
    message
  })
  
  // 自动滚动到底部
  setTimeout(() => {
    if (consoleOutput.value) {
      consoleOutput.value.scrollTop = consoleOutput.value.scrollHeight
    }
  }, 100)
}

const toggleConsole = () => {
  showConsole.value = !showConsole.value
  addConsoleLog('info', `Console ${showConsole.value ? 'opened' : 'closed'}`)
}

const clearConsole = () => {
  consoleLogs.value = []
  addConsoleLog('info', 'Console cleared')
}

const exportLogs = () => {
  const logs = consoleLogs.value.map(log => 
    `[${log.timestamp}] ${log.type.toUpperCase()}: ${log.message}`
  ).join('\n')
  
  const blob = new Blob([logs], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `session-logs-${new Date().toISOString().split('T')[0]}.txt`
  a.click()
  URL.revokeObjectURL(url)
  
  addConsoleLog('info', 'Logs exported successfully')
}

const addTestLog = () => {
  const testMessages = [
    'Test log entry added',
    'System health check: OK',
    'Database connection: Active',
    'Cache status: Optimal',
    'Memory usage: 64%'
  ]
  
  const message = testMessages[Math.floor(Math.random() * testMessages.length)]
  addConsoleLog('debug', message)
}

const interceptConsole = () => {
  const originalLog = console.log
  const originalWarn = console.warn
  const originalError = console.error
  
  console.log = (...args) => {
    originalLog.apply(console, args)
    addConsoleLog('info', args.join(' '))
  }
  
  console.warn = (...args) => {
    originalWarn.apply(console, args)
    addConsoleLog('warn', args.join(' '))
  }
  
  console.error = (...args) => {
    originalError.apply(console, args)
    addConsoleLog('error', args.join(' '))
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

const getRoleLabel = (role) => {
  const labels = {
    admin: 'Administrator',
    librarian: 'Librarian',
    staff: 'Library Staff',
    student: 'Student',
    member: 'Library Member'
  }
  return labels[role] || role
}

const formatTime = (timeString) => {
  if (!timeString) return 'Unknown'
  return new Date(timeString).toLocaleString()
}

const formatPermission = (permission) => {
  const formatted = permission.replace(/_/g, ' ')
  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

const getLogClass = (type) => {
  const classes = {
    info: 'text-info',
    warn: 'text-warning',
    error: 'text-danger',
    success: 'text-success',
    debug: 'text-muted'
  }
  return classes[type] || 'text-light'
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
  border-radius: 25px;
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}

.alert {
  border-radius: 10px;
}

.gap-3 {
  gap: 1rem !important;
}

.console-output {
  max-height: 300px;
  overflow-y: auto;
  background-color: #1a1a1a;
  padding: 10px;
  border-radius: 5px;
  font-size: 0.85rem;
  line-height: 1.4;
}

.console-line {
  margin-bottom: 2px;
  word-wrap: break-word;
}

.console-line:last-child {
  margin-bottom: 0;
}

.console-controls {
  border-top: 1px solid #444;
  padding-top: 10px;
}

.badge {
  font-size: 0.75rem;
}
</style>