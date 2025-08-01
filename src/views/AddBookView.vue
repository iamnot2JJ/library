<template>
  <div class="container mt-4">
    <div class="row">
      <div class="col-md-8 offset-md-2">
        <h1 class="text-center mb-4">📚 Add New Book</h1>
        
        <!-- 权限检查 -->
        <div v-if="!hasWritePermission" class="alert alert-warning">
          <h5 class="alert-heading">⚠️ Insufficient Permissions</h5>
          <p class="mb-0">
            You need write permissions to add books. Current role: 
            <span class="badge ms-1" :class="getRoleBadgeClass(currentUser?.role)">
              {{ currentUser?.role || 'Guest' }}
            </span>
          </p>
        </div>
        
        <div v-else class="card">
          <div class="card-header bg-primary text-white">
            <h5 class="mb-0">
              <i class="bi bi-plus-circle me-2"></i>
              Add Book Form
            </h5>
          </div>
          <div class="card-body">
            <form @submit.prevent="addBook">
              <div class="mb-3">
                <label for="isbn" class="form-label">ISBN:</label>
                <input 
                  type="text" 
                  v-model="isbn" 
                  id="isbn" 
                  class="form-control"
                  placeholder="Enter ISBN number"
                  required 
                />
              </div>
              <div class="mb-3">
                <label for="name" class="form-label">Book Name:</label>
                <input 
                  type="text" 
                  v-model="name" 
                  id="name" 
                  class="form-control"
                  placeholder="Enter book name"
                  required 
                />
              </div>
              <div class="text-center">
                <button type="submit" class="btn btn-primary" :disabled="loading">
                  <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"></span>
                  {{ loading ? 'Adding...' : 'Add Book' }}
                </button>
              </div>
            </form>
          </div>
        </div>
        
        <div v-if="successMessage" class="alert alert-success mt-3">
          <i class="bi bi-check-circle me-2"></i>{{ successMessage }}
        </div>

        <div v-if="errorMessage" class="alert alert-danger mt-3">
          <i class="bi bi-exclamation-triangle me-2"></i>{{ errorMessage }}
        </div>
      </div>
    </div>

    <!-- 数据管理工具 -->
    <div v-if="hasWritePermission" class="row mt-4">
      <div class="col-12">
        <DataManagementTools @dataChanged="refreshBookList" />
      </div>
    </div>

    <!-- 书籍列表 -->
    <div class="row mt-5">
      <div class="col-12">
        <BookList ref="bookListRef" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { currentUser, hasPermission, initializeAuth } from '../auth'
import BookList from '../components/BookList.vue'
import DataManagementTools from '../components/DataManagementTools.vue'

const isbn = ref('')
const name = ref('')
const loading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')
const bookListRef = ref(null)

onMounted(() => {
  // 初始化认证状态
  initializeAuth()
})

// 检查写入权限
const hasWritePermission = computed(() => {
  return hasPermission('write') || hasPermission('manage_books')
})

const addBook = async () => {
  try {
    loading.value = true
    errorMessage.value = ''
    
    // 再次检查权限
    if (!hasWritePermission.value) {
      errorMessage.value = 'You do not have permission to add books'
      return
    }
    
    const isbnNumber = Number(isbn.value)
    
    if (isNaN(isbnNumber)) {
      errorMessage.value = 'ISBN must be a valid number'
      return
    }

    const { default: db } = await import('../firebase/init.js')
    const { collection, addDoc } = await import('firebase/firestore')

    await addDoc(collection(db, 'books'), {
      isbn: isbnNumber,
      name: name.value.trim(),
      addedBy: currentUser.value?.username || 'unknown',
      addedAt: new Date().toISOString(),
      addedByRole: currentUser.value?.role || 'unknown'
    })

    successMessage.value = `Book "${name.value}" with ISBN ${isbnNumber} added successfully!`

    // 记录到控制台
    console.log('📚 Book Added:', {
      name: name.value,
      isbn: isbnNumber,
      addedBy: currentUser.value?.displayName,
      role: currentUser.value?.role,
      timestamp: new Date().toISOString()
    })

    isbn.value = ''
    name.value = ''
 
    if (bookListRef.value) {
      bookListRef.value.refreshBooks()
    }

    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
    
  } catch (error) {
    if (error.code === 'permission-denied') {
      errorMessage.value = 'Permission denied. Please check your Firestore security rules.'
    } else {
      errorMessage.value = 'Error adding book: ' + error.message
    }
    
    console.error('❌ Add Book Error:', {
      error: error.message,
      user: currentUser.value?.displayName,
      role: currentUser.value?.role,
      timestamp: new Date().toISOString()
    })
  } finally {
    loading.value = false
  }
}

const refreshBookList = () => {
  if (bookListRef.value) {
    bookListRef.value.refreshBooks()
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
.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}

.card {
  border-radius: 15px;
}

.card-header {
  border-radius: 15px 15px 0 0 !important;
}

.alert {
  border-radius: 10px;
}

.badge {
  font-size: 0.75rem;
}
</style>