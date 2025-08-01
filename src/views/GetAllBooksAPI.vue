<template>
  <div class="container mt-4">
    <div class="row">
      <div class="col-12">
        <h1 class="text-center mb-4">📚 Get All Books API</h1>
        
        <!-- Loading State -->
        <div v-if="loading" class="text-center">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-2">Fetching books from Firebase...</p>
        </div>
        
        <!-- Error State -->
        <div v-if="error" class="alert alert-danger">
          <h5 class="alert-heading">❌ Error</h5>
          <p class="mb-0">{{ error }}</p>
          <button @click="refreshBooks" class="btn btn-sm btn-outline-danger mt-2">
            Try Again
          </button>
        </div>
        
        <!-- Statistics Summary -->
        <div v-if="!loading && !error && booksData.length" class="row mb-4">
          <div class="col-md-3">
            <div class="card bg-primary text-white">
              <div class="card-body text-center">
                <h3 class="card-title">{{ booksData.length }}</h3>
                <p class="card-text">Total Books</p>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card bg-success text-white">
              <div class="card-body text-center">
                <h3 class="card-title">{{ averageIsbn }}</h3>
                <p class="card-text">Average ISBN</p>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card bg-info text-white">
              <div class="card-body text-center">
                <h3 class="card-title">{{ uniqueAuthors }}</h3>
                <p class="card-text">Unique Authors</p>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card bg-warning text-dark">
              <div class="card-body text-center">
                <h3 class="card-title">{{ lastUpdated }}</h3>
                <p class="card-text">Last Updated</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Books Table -->
        <div v-if="!loading && !error && booksData.length" class="card mb-4">
          <div class="card-header bg-secondary text-white d-flex justify-content-between align-items-center">
            <h5 class="mb-0">📖 Books Table View</h5>
            <div>
              <button @click="toggleView" class="btn btn-sm btn-outline-light me-2">
                {{ showTable ? 'Show JSON' : 'Show Table' }}
              </button>
              <button @click="refreshBooks" class="btn btn-sm btn-outline-light">
                🔄 Refresh
              </button>
            </div>
          </div>
          <div class="card-body" v-if="showTable">
            <div class="table-responsive">
              <table class="table table-striped table-hover">
                <thead class="table-dark">
                  <tr>
                    <th>ID</th>
                    <th>Book Name</th>
                    <th>ISBN</th>
                    <th>Added By</th>
                    <th>Date Added</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="book in booksData" :key="book.id">
                    <td><code>{{ book.id }}</code></td>
                    <td><strong>{{ book.name }}</strong></td>
                    <td>
                      <span class="badge" :class="getIsbnBadgeClass(book.isbn)">
                        {{ book.isbn }}
                      </span>
                    </td>
                    <td>
                      <span v-if="book.addedBy">{{ book.addedBy }}</span>
                      <span v-else class="text-muted">Unknown</span>
                    </td>
                    <td>
                      <span v-if="book.addedAt" class="text-muted">
                        {{ formatDate(book.addedAt) }}
                      </span>
                      <span v-else class="text-muted">Unknown</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <!-- JSON API Response -->
        <div v-if="!loading && !error && apiResponse" class="card">
          <div class="card-header bg-dark text-white d-flex justify-content-between align-items-center">
            <h5 class="mb-0">📄 JSON API Response</h5>
            <div>
              <button @click="copyToClipboard" class="btn btn-sm btn-outline-light me-2">
                <i class="bi bi-clipboard"></i> Copy JSON
              </button>
              <button @click="downloadJson" class="btn btn-sm btn-outline-light">
                <i class="bi bi-download"></i> Download
              </button>
            </div>
          </div>
          <div class="card-body" v-if="!showTable">
            <div class="api-response">
              <pre>{{ JSON.stringify(apiResponse, null, 2) }}</pre>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="!loading && !error && booksData.length === 0" class="text-center">
          <div class="card">
            <div class="card-body">
              <h4 class="text-muted">📭 No Books Found</h4>
              <p class="text-muted">There are no books in the database yet.</p>
              <router-link to="/addbook" class="btn btn-primary">
                Add Your First Book
              </router-link>
            </div>
          </div>
        </div>

        <!-- Refresh Button -->
        <div class="text-center mt-4">
          <button @click="refreshBooks" class="btn btn-primary" :disabled="loading">
            <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
            🔄 Refresh Books
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

const booksData = ref([])
const loading = ref(false)
const error = ref(null)
const apiResponse = ref(null)
const showTable = ref(true)

// Firebase database reference
let db = null

// Computed properties
const averageIsbn = computed(() => {
  if (booksData.value.length === 0) return 0
  const sum = booksData.value.reduce((total, book) => total + (book.isbn || 0), 0)
  return Math.round(sum / booksData.value.length)
})

const uniqueAuthors = computed(() => {
  const authors = new Set()
  booksData.value.forEach(book => {
    if (book.addedBy) authors.add(book.addedBy)
  })
  return authors.size
})

const lastUpdated = computed(() => {
  if (booksData.value.length === 0) return 'N/A'
  return new Date().toLocaleTimeString()
})

// Initialize Firebase
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

// Fetch all books from Firebase
const getAllBooks = async () => {
  loading.value = true
  error.value = null
  
  try {
    if (!db) {
      const success = await initializeFirebase()
      if (!success) return
    }
    
    const { collection, getDocs, orderBy, query } = await import('firebase/firestore')
    
    // Create query to get all books, ordered by name
    const booksCollection = collection(db, 'books')
    const q = query(booksCollection, orderBy('name'))
    
    const querySnapshot = await getDocs(q)
    
    const books = []
    querySnapshot.forEach((doc) => {
      books.push({
        id: doc.id,
        ...doc.data()
      })
    })
    
    booksData.value = books
    
    // Create API response
    apiResponse.value = {
      success: true,
      count: books.length,
      data: {
        books: books,
        statistics: {
          totalBooks: books.length,
          averageIsbn: averageIsbn.value,
          uniqueAuthors: uniqueAuthors.value,
          isbnRanges: {
            low: books.filter(book => book.isbn <= 1000).length,
            medium: books.filter(book => book.isbn > 1000 && book.isbn <= 2000).length,
            high: books.filter(book => book.isbn > 2000).length
          }
        }
      },
      metadata: {
        timestamp: new Date().toISOString(),
        source: "Firebase Firestore",
        collection: "books",
        version: "1.0.0",
        requestId: Math.random().toString(36).substring(7)
      }
    }
    
  } catch (err) {
    error.value = `Error fetching books: ${err.message}`
    if (err.code === 'permission-denied') {
      error.value = 'Permission denied: Please check your Firestore security rules'
    } else if (err.code === 'unavailable') {
      error.value = 'Firestore is currently unavailable. Please check your internet connection.'
    }
    console.error('Error fetching books:', err)
  } finally {
    loading.value = false
  }
}

const refreshBooks = () => {
  getAllBooks()
}

const toggleView = () => {
  showTable.value = !showTable.value
}

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(JSON.stringify(apiResponse.value, null, 2))
    alert('JSON copied to clipboard!')
  } catch (err) {
    console.error('Failed to copy to clipboard:', err)
    alert('Failed to copy to clipboard')
  }
}

const downloadJson = () => {
  const dataStr = JSON.stringify(apiResponse.value, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = `books-api-${new Date().toISOString().split('T')[0]}.json`
  link.click()
  URL.revokeObjectURL(url)
}

const formatDate = (dateString) => {
  if (!dateString) return 'Unknown'
  try {
    return new Date(dateString).toLocaleDateString()
  } catch (err) {
    return 'Invalid Date'
  }
}

const getIsbnBadgeClass = (isbn) => {
  if (isbn <= 1000) return 'bg-primary'
  if (isbn <= 2000) return 'bg-success'
  return 'bg-warning text-dark'
}

onMounted(() => {
  getAllBooks()
})

defineExpose({
  refreshBooks,
  getAllBooks
})
</script>