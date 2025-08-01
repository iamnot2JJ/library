<template>
  <div class="book-list mt-4">
    <div class="card mb-4">
      <div class="card-header bg-primary text-white">
        <h5 class="mb-0">📊 Advanced Query Controls</h5>
      </div>
      <div class="card-body">
        <div class="row">
          <!-- Where -->
          <div class="col-md-4">
            <label class="form-label">Where Condition</label>
            <select v-model="queryCondition" class="form-select mb-2">
              <option value="all">All Books</option>
              <option value="isbn_greater_1000">ISBN > 1000</option>
              <option value="isbn_less_1000">ISBN ≤ 1000</option>
              <option value="isbn_range">ISBN between 1000-2000</option>
              <option value="name_contains">Name contains text</option>
            </select>
            <input 
              v-if="queryCondition === 'name_contains'" 
              v-model="searchText" 
              type="text" 
              class="form-control form-control-sm" 
              placeholder="Enter search text"
            />
          </div>
          
          <!-- Order By -->
          <div class="col-md-3">
            <label class="form-label">Order By</label>
            <select v-model="sortBy" class="form-select mb-2">
              <option value="isbn_asc">ISBN (Ascending)</option>
              <option value="isbn_desc">ISBN (Descending)</option>
              <option value="name_asc">Name (A-Z)</option>
              <option value="name_desc">Name (Z-A)</option>
            </select>
          </div>
          
          <!-- Limit -->
          <div class="col-md-2">
            <label class="form-label">Limit</label>
            <select v-model="limitCount" class="form-select">
              <option value="0">No Limit</option>
              <option value="5">5 Books</option>
              <option value="10">10 Books</option>
              <option value="20">20 Books</option>
            </select>
          </div>
          
          <!-- executeQuery -->
          <div class="col-md-3">
            <label class="form-label">&nbsp;</label>
            <div class="d-grid">
              <button @click="executeQuery" class="btn btn-success" :disabled="loading">
                <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                🔍 Execute Query
              </button>
            </div>
          </div>
        </div>
        
        <div class="row mt-3">
          <div class="col-12">
            <div class="alert alert-info mb-0">
              <small>
                <strong>Query Results:</strong> {{ books.length }} books found
                <span v-if="queryInfo"> | {{ queryInfo }}</span>
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>

    <h2 class="text-center mb-4">📚 Book Management System</h2>
    
    <div v-if="loading" class="text-center">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p>Loading books...</p>
    </div>
    
    <div v-else-if="error" class="alert alert-danger">
      <strong>Error:</strong> {{ error }}
    </div>
    
    <div v-else-if="books.length === 0" class="alert alert-info text-center">
      <p>No books found matching your query criteria.</p>
    </div>
    
    <div v-else>
      <div class="table-responsive">
        <table class="table table-striped table-hover">
          <thead class="table-dark">
            <tr>
              <th>Book Name</th>
              <th>ISBN</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="book in books" :key="book.id">
              <td>
                <input 
                  v-if="editingBook === book.id" 
                  v-model="editForm.name" 
                  type="text" 
                  class="form-control form-control-sm"
                />
                <span v-else>{{ book.name }}</span>
              </td>
              <td>

                <input 
                  v-if="editingBook === book.id" 
                  v-model="editForm.isbn" 
                  type="number" 
                  class="form-control form-control-sm"
                />

                <span v-else>{{ book.isbn }}</span>
              </td>
              <td>
                <div class="btn-group" role="group">

                  <template v-if="editingBook === book.id">
                    <button 
                      @click="saveEdit(book.id)" 
                      class="btn btn-success btn-sm"
                      :disabled="updating"
                    >
                      <span v-if="updating" class="spinner-border spinner-border-sm me-1"></span>
                      ✅ Save
                    </button>
                    <button 
                      @click="cancelEdit" 
                      class="btn btn-secondary btn-sm"
                      :disabled="updating"
                    >
                      ❌ Cancel
                    </button>
                  </template>
                  

                  <template v-else>
                    <button 
                      @click="startEdit(book)" 
                      class="btn btn-warning btn-sm"
                      :disabled="deleting || updating"
                    >
                      ✏️ Edit
                    </button>
                    <button 
                      @click="deleteBook(book.id, book.name)" 
                      class="btn btn-danger btn-sm"
                      :disabled="deleting || updating"
                    >
                      <span v-if="deleting" class="spinner-border spinner-border-sm me-1"></span>
                      🗑️ Delete
                    </button>
                  </template>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const books = ref([])
const loading = ref(true)
const deleting = ref(false)
const updating = ref(false)
const error = ref(null)

// 查询参数
const queryCondition = ref('isbn_greater_1000')
const sortBy = ref('isbn_asc')
const limitCount = ref(0)
const searchText = ref('')
const queryInfo = ref('')

// 编辑相关
const editingBook = ref(null)
const editForm = ref({
  name: '',
  isbn: ''
})

// 动态导入 Firebase
let db = null

const initializeFirebase = async () => {
  try {
    const { default: database } = await import('../firebase/init.js')
    db = database
    return true
  } catch (err) {
    error.value = `Firebase initialization failed: ${err.message}`
    return false
  }
}

const executeQuery = async () => {
  try {
    loading.value = true
    error.value = null
    
    if (!db) {
      const success = await initializeFirebase()
      if (!success) return
    }
    
    const { collection, getDocs, query, where, orderBy, limit } = await import('firebase/firestore')
    
    const booksCollection = collection(db, 'books')
    let q = booksCollection
    
    // WHERE 
    switch (queryCondition.value) {
      case 'isbn_greater_1000':
        q = query(q, where('isbn', '>', 1000))
        queryInfo.value = 'WHERE: ISBN > 1000'
        break
      case 'isbn_less_1000':
        q = query(q, where('isbn', '<=', 1000))
        queryInfo.value = 'WHERE: ISBN ≤ 1000'
        break
      case 'isbn_range':
        q = query(q, where('isbn', '>', 1000), where('isbn', '<', 2000))
        queryInfo.value = 'WHERE: 1000 < ISBN < 2000'
        break
      case 'name_contains':
        queryInfo.value = `WHERE: Name contains "${searchText.value}"`
        break
      case 'all':
      default:
        queryInfo.value = 'WHERE: All books'
        break
    }
    
    // ORDER BY
    const [orderField, orderDirection] = sortBy.value.split('_')
    q = query(q, orderBy(orderField, orderDirection))
    queryInfo.value += ` | ORDER BY: ${orderField} ${orderDirection.toUpperCase()}`
    
    // LIMIT
    if (limitCount.value > 0) {
      q = query(q, limit(parseInt(limitCount.value)))
      queryInfo.value += ` | LIMIT: ${limitCount.value}`
    }
    
    const querySnapshot = await getDocs(q)
    
    books.value = []
    querySnapshot.forEach((docSnap) => {
      books.value.push({
        id: docSnap.id,
        ...docSnap.data()
      })
    })
    
    // 客户端过滤（对于 name_contains）
    if (queryCondition.value === 'name_contains' && searchText.value) {
      books.value = books.value.filter(book => 
        book.name.toLowerCase().includes(searchText.value.toLowerCase())
      )
    }
    
  } catch (err) {
    error.value = err.message
    if (err.code === 'permission-denied') {
      error.value = 'Permission denied: Please check your Firestore security rules'
    } else if (err.code === 'unavailable') {
      error.value = 'Firestore is currently unavailable. Please check your internet connection.'
    }
  } finally {
    loading.value = false
  }
}

const startEdit = (book) => {
  editingBook.value = book.id
  editForm.value = {
    name: book.name,
    isbn: book.isbn
  }
}

const cancelEdit = () => {
  editingBook.value = null
  editForm.value = {
    name: '',
    isbn: ''
  }
}

const saveEdit = async (bookId) => {
  try {
    updating.value = true
    
    if (!editForm.value.name.trim()) {
      alert('Book name cannot be empty')
      return
    }
    
    const isbnNumber = Number(editForm.value.isbn)
    if (isNaN(isbnNumber) || isbnNumber <= 0) {
      alert('ISBN must be a valid positive number')
      return
    }
    
    const { updateDoc, doc } = await import('firebase/firestore')
    
    await updateDoc(doc(db, 'books', bookId), {
      name: editForm.value.name.trim(),
      isbn: isbnNumber
    })

    const bookIndex = books.value.findIndex(book => book.id === bookId)
    if (bookIndex !== -1) {
      books.value[bookIndex] = {
        ...books.value[bookIndex],
        name: editForm.value.name.trim(),
        isbn: isbnNumber
      }
    }
    
    editingBook.value = null
    editForm.value = { name: '', isbn: '' }
    
    alert('Book updated successfully!')
    
  } catch (err) {
    alert('Error updating book: ' + err.message)
  } finally {
    updating.value = false
  }
}

const deleteBook = async (bookId, bookName) => {
  if (!confirm(`Are you sure you want to delete "${bookName}"?`)) {
    return
  }
  
  try {
    deleting.value = true
    
    const { deleteDoc, doc } = await import('firebase/firestore')
    
    await deleteDoc(doc(db, 'books', bookId))
    
    books.value = books.value.filter(book => book.id !== bookId)
    
    alert(`"${bookName}" deleted successfully!`)
    
  } catch (err) {
    alert('Error deleting book: ' + err.message)
  } finally {
    deleting.value = false
  }
}

// 组件挂载时执行默认查询
onMounted(() => {
  executeQuery()
})

// 暴露刷新方法
defineExpose({
  refreshBooks: executeQuery
})
</script>

<style scoped>
.book-list {
  margin-top: 2rem;
}

.table {
  margin-top: 1rem;
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}

.btn-group .btn {
  margin-right: 0.25rem;
}

.btn-group .btn:last-child {
  margin-right: 0;
}

.card-header {
  border-radius: 0.375rem 0.375rem 0 0;
}

.form-control-sm {
  max-width: 200px;
}

.alert {
  border-radius: 0.5rem;
}
</style>