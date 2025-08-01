<template>
  <div class="data-tools mt-4">
    <div class="card border-info">
      <div class="card-header bg-info text-white">
        <h5 class="mb-0">🛠️ Data Management Tools</h5>
      </div>
      <div class="card-body">
        <div class="row">
          <!-- 批量添加示例数据 -->
          <div class="col-md-4">
            <h6>📊 Sample Data</h6>
            <button 
              @click="addSampleData" 
              class="btn btn-primary btn-sm w-100 mb-2"
              :disabled="loading"
            >
              <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
              Add Sample Books
            </button>
            <small class="text-muted">Adds 10 sample books with various ISBNs</small>
          </div>
          
          <!-- 数据统计 -->
          <div class="col-md-4">
            <h6>📈 Statistics</h6>
            <button 
              @click="getStatistics" 
              class="btn btn-info btn-sm w-100 mb-2"
              :disabled="loading"
            >
              <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
              Get Database Stats
            </button>
            <small class="text-muted">Show total books and ISBN ranges</small>
          </div>
          
          <!-- 清空数据 -->
          <div class="col-md-4">
            <h6>🗑️ Cleanup</h6>
            <button 
              @click="clearAllData" 
              class="btn btn-danger btn-sm w-100 mb-2"
              :disabled="loading"
            >
              <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
              Clear All Books
            </button>
            <small class="text-muted">⚠️ Permanently delete all books</small>
          </div>
        </div>
        
        <!-- 统计信息显示 -->
        <div v-if="statistics" class="mt-3">
          <div class="alert alert-info">
            <h6 class="alert-heading">📊 Database Statistics</h6>
            <div class="row">
              <div class="col-md-3">
                <strong>Total Books:</strong> {{ statistics.total }}
              </div>
              <div class="col-md-3">
                <strong>ISBN > 1000:</strong> {{ statistics.highIsbn }}
              </div>
              <div class="col-md-3">
                <strong>ISBN ≤ 1000:</strong> {{ statistics.lowIsbn }}
              </div>
              <div class="col-md-3">
                <strong>Avg ISBN:</strong> {{ statistics.avgIsbn }}
              </div>
            </div>
          </div>
        </div>
        
        <!-- 操作结果显示 -->
        <div v-if="message" class="mt-3">
          <div class="alert" :class="messageType === 'success' ? 'alert-success' : 'alert-warning'">
            {{ message }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import db from '../firebase/init.js'
import { 
  collection, 
  addDoc, 
  getDocs,
  deleteDoc,
  doc
} from 'firebase/firestore'

const loading = ref(false)
const statistics = ref(null)
const message = ref('')
const messageType = ref('success')

// 定义 emits 以便通知父组件刷新数据
const emit = defineEmits(['dataChanged'])

// 示例书籍数据
const sampleBooks = [
  { name: 'Yiwei Book', isbn: 1018 },
  { name: 'Audrey Novel', isbn: 1012 },
  { name: 'Programming Fundamentals', isbn: 2500 },
  { name: 'Web Development Guide', isbn: 1850 },
  { name: 'Database Design', isbn: 950 },
  { name: 'Machine Learning Basics', isbn: 3200 },
  { name: 'Vue.js Complete Guide', isbn: 1500 },
  { name: 'Firebase Tutorial', isbn: 750 },
  { name: 'Advanced JavaScript', isbn: 2100 },
  { name: 'Computer Science Theory', isbn: 450 }
]

// 添加示例数据
const addSampleData = async () => {
  try {
    loading.value = true
    message.value = ''
    
    let addedCount = 0
    
    for (const book of sampleBooks) {
      try {
        await addDoc(collection(db, 'books'), book)
        addedCount++
      } catch (error) {
        console.warn(`Failed to add book: ${book.name}`, error)
      }
    }
    
    message.value = `Successfully added ${addedCount} sample books!`
    messageType.value = 'success'
    
    // 通知父组件刷新数据
    emit('dataChanged')
    
  } catch (error) {
    console.error('Error adding sample data:', error)
    message.value = 'Error adding sample data: ' + error.message
    messageType.value = 'error'
  } finally {
    loading.value = false
    // 3秒后清除消息
    setTimeout(() => {
      message.value = ''
    }, 3000)
  }
}

// 获取统计信息
const getStatistics = async () => {
  try {
    loading.value = true
    message.value = ''
    
    const querySnapshot = await getDocs(collection(db, 'books'))
    
    const books = []
    querySnapshot.forEach((doc) => {
      books.push(doc.data())
    })
    
    const total = books.length
    const highIsbn = books.filter(book => book.isbn > 1000).length
    const lowIsbn = books.filter(book => book.isbn <= 1000).length
    const avgIsbn = total > 0 ? Math.round(books.reduce((sum, book) => sum + book.isbn, 0) / total) : 0
    
    statistics.value = {
      total,
      highIsbn,  
      lowIsbn,
      avgIsbn
    }
    
    message.value = `Statistics updated successfully!`
    messageType.value = 'success'
    
  } catch (error) {
    console.error('Error getting statistics:', error)
    message.value = 'Error getting statistics: ' + error.message
    messageType.value = 'error'
  } finally {
    loading.value = false
    // 3秒后清除消息
    setTimeout(() => {
      message.value = ''
    }, 3000)
  }
}

// 清空所有数据
const clearAllData = async () => {
  if (!confirm('⚠️ Are you sure you want to delete ALL books? This action cannot be undone!')) {
    return
  }
  
  if (!confirm('This will permanently delete all books from the database. Type "DELETE" to confirm.')) {
    return
  }
  
  try {
    loading.value = true
    message.value = ''
    
    const querySnapshot = await getDocs(collection(db, 'books'))
    
    let deletedCount = 0
    const deletePromises = []
    
    querySnapshot.forEach((docSnapshot) => {
      deletePromises.push(deleteDoc(doc(db, 'books', docSnapshot.id)))
    })
    
    await Promise.all(deletePromises)
    deletedCount = querySnapshot.size
    
    message.value = `Successfully deleted ${deletedCount} books from the database.`
    messageType.value = 'success'
    
    // 清除统计信息
    statistics.value = null
    
    // 通知父组件刷新数据
    emit('dataChanged')
    
  } catch (error) {
    console.error('Error clearing data:', error)
    message.value = 'Error clearing data: ' + error.message
    messageType.value = 'error'
  } finally {
    loading.value = false
    // 3秒后清除消息
    setTimeout(() => {
      message.value = ''
    }, 5000)
  }
}
</script>

<style scoped>
.data-tools {
  margin-top: 1rem;
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}

.card-header {
  border-radius: 0.375rem 0.375rem 0 0;
}

.btn {
  border-radius: 0.375rem;
}

.alert {
  border-radius: 0.5rem;
  margin-bottom: 0;
}
</style>