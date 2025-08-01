import { ref } from 'vue'

// 认证状态
export const isAuthenticated = ref(false)
export const currentUser = ref(null)

// 预定义用户数据库（包含多种角色）
const users = [
  {
    id: 1,
    username: 'admin',
    password: 'admin123',
    email: 'admin@library.com',
    role: 'admin',
    displayName: 'System Administrator',
    permissions: ['read', 'write', 'delete', 'manage_users', 'system_config'],
    department: 'IT Department',
    lastLogin: null
  },
  {
    id: 2,
    username: 'librarian',
    password: 'lib123',
    email: 'librarian@library.com',
    role: 'librarian',
    displayName: 'Head Librarian',
    permissions: ['read', 'write', 'manage_books', 'manage_members'],
    department: 'Library Services',
    lastLogin: null
  },
  {
    id: 3,
    username: 'staff',
    password: 'staff123',
    email: 'staff@library.com',
    role: 'staff',
    displayName: 'Library Staff',
    permissions: ['read', 'write', 'manage_books'],
    department: 'Library Services',
    lastLogin: null
  },
  {
    id: 4,
    username: 'student',
    password: 'student123',
    email: 'student@university.edu',
    role: 'student',
    displayName: 'John Student',
    permissions: ['read'],
    department: 'Computer Science',
    lastLogin: null
  },
  {
    id: 5,
    username: 'member',
    password: 'member123',
    email: 'member@email.com',
    role: 'member',
    displayName: 'Library Member',
    permissions: ['read'],
    department: 'Public',
    lastLogin: null
  }
]

// 登录函数
export const login = (username, password) => {
  const user = users.find(u => u.username === username && u.password === password)
  
  if (user) {
    // 更新最后登录时间
    user.lastLogin = new Date().toISOString()
    
    // 创建用户会话
    currentUser.value = {
      ...user,
      sessionId: generateSessionId(),
      loginTime: new Date().toISOString()
    }
    
    isAuthenticated.value = true
    
    // 保存到 localStorage（可选）
    localStorage.setItem('currentUser', JSON.stringify(currentUser.value))
    localStorage.setItem('isAuthenticated', 'true')
    
    // 开发者控制台日志
    console.log('🔐 Login Successful:', {
      user: currentUser.value.displayName,
      role: currentUser.value.role,
      permissions: currentUser.value.permissions,
      sessionId: currentUser.value.sessionId,
      timestamp: currentUser.value.loginTime
    })
    
    return true
  }
  
  console.log('❌ Login Failed:', { username, timestamp: new Date().toISOString() })
  return false
}

// 登出函数
export const logout = () => {
  if (currentUser.value) {
    // 开发者控制台日志
    console.log('🚪 Logout:', {
      user: currentUser.value.displayName,
      role: currentUser.value.role,
      sessionId: currentUser.value.sessionId,
      sessionDuration: calculateSessionDuration(),
      logoutTime: new Date().toISOString()
    })
  }
  
  // 清除状态
  isAuthenticated.value = false
  currentUser.value = null
  
  // 清除 localStorage
  localStorage.removeItem('currentUser')
  localStorage.removeItem('isAuthenticated')
}

// 检查权限
export const hasPermission = (permission) => {
  if (!currentUser.value) return false
  return currentUser.value.permissions.includes(permission)
}

// 检查角色
export const hasRole = (role) => {
  if (!currentUser.value) return false
  return currentUser.value.role === role
}

// 初始化认证状态（从 localStorage 恢复）
export const initializeAuth = () => {
  try {
    const savedUser = localStorage.getItem('currentUser')
    const savedAuth = localStorage.getItem('isAuthenticated')
    
    if (savedUser && savedAuth === 'true') {
      currentUser.value = JSON.parse(savedUser)
      isAuthenticated.value = true
      
      console.log('🔄 Session Restored:', {
        user: currentUser.value.displayName,
        role: currentUser.value.role,
        sessionId: currentUser.value.sessionId
      })
    }
  } catch (error) {
    console.error('Error restoring session:', error)
    logout() // 清除损坏的会话
  }
}

// 获取所有可用角色（用于演示）
export const getAvailableRoles = () => {
  return [
    { role: 'admin', label: 'Administrator', description: 'Full system access' },
    { role: 'librarian', label: 'Librarian', description: 'Manage books and members' },
    { role: 'staff', label: 'Library Staff', description: 'Basic book management' },
    { role: 'student', label: 'Student', description: 'Read-only access' },
    { role: 'member', label: 'Library Member', description: 'Public access' }
  ]
}

// 获取测试用户（用于演示）
export const getTestUsers = () => {
  return users.map(user => ({
    username: user.username,
    password: user.password,
    role: user.role,
    displayName: user.displayName
  }))
}

// 辅助函数
function generateSessionId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

function calculateSessionDuration() {
  if (!currentUser.value?.loginTime) return null
  
  const loginTime = new Date(currentUser.value.loginTime)
  const now = new Date()
  const duration = Math.round((now - loginTime) / 1000) // 秒
  
  const hours = Math.floor(duration / 3600)
  const minutes = Math.floor((duration % 3600) / 60)
  const seconds = duration % 60
  
  return `${hours}h ${minutes}m ${seconds}s`
}