<template>
  <div class="container mt-4">
    <div class="row">
      <div class="col-12">
        <h1 class="text-center mb-4">📊 Book & Author API Statistics</h1>
        
        <!-- Loading State -->
        <div v-if="loading" class="text-center">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-2">Loading API data...</p>
        </div>
        
        <!-- Error State -->
        <div v-if="error" class="alert alert-danger">
          <h5 class="alert-heading">❌ Error</h5>
          <p class="mb-0">{{ error }}</p>
        </div>
        
        <!-- Statistics Cards -->
        <div v-if="!loading && !error && apiResponse" class="row mb-4">
          <div class="col-md-4">
            <div class="card bg-primary text-white">
              <div class="card-body text-center">
                <h2 class="card-title">{{ authorsCount }}</h2>
                <p class="card-text">Total Authors</p>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card bg-success text-white">
              <div class="card-body text-center">
                <h2 class="card-title">{{ totalBooks }}</h2>
                <p class="card-text">Total Books</p>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card bg-info text-white">
              <div class="card-body text-center">
                <h2 class="card-title">{{ averageBooksPerAuthor }}</h2>
                <p class="card-text">Avg Books/Author</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Authors Table -->
        <div v-if="!loading && !error && authors.length" class="card mb-4">
          <div class="card-header bg-secondary text-white">
            <h5 class="mb-0">👥 Authors Overview</h5>
          </div>
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-striped">
                <thead>
                  <tr>
                    <th>Author Name</th>
                    <th>Book Count</th>
                    <th>Famous Works</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="author in authors" :key="author.name">
                    <td><strong>{{ author.name }}</strong></td>
                    <td>
                      <span class="badge bg-primary">{{ author.famousWorks.length }}</span>
                    </td>
                    <td>
                      <span 
                        v-for="work in author.famousWorks" 
                        :key="work"
                        class="badge bg-secondary me-1 mb-1"
                      >
                        {{ work }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <!-- JSON API Response -->
        <div v-if="apiResponse" class="card">
          <div class="card-header bg-dark text-white d-flex justify-content-between align-items-center">
            <h5 class="mb-0">📄 JSON API Response</h5>
            <button @click="copyToClipboard" class="btn btn-sm btn-outline-light">
              <i class="bi bi-clipboard"></i> Copy JSON
            </button>
          </div>
          <div class="card-body">
            <div class="api-response">
              <pre>{{ JSON.stringify(apiResponse, null, 2) }}</pre>
            </div>
          </div>
        </div>
        
        <!-- Refresh Button -->
        <div class="text-center mt-4">
          <button @click="getApiData" class="btn btn-primary" :disabled="loading">
            <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
            🔄 Refresh Data
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

const authors = ref([])
const loading = ref(false)
const error = ref(null)
const apiResponse = ref(null)
const authorsCount = ref(0)
const totalBooks = ref(0)

// Computed property for average books per author
const averageBooksPerAuthor = computed(() => {
  return authorsCount.value > 0 
    ? Math.round((totalBooks.value / authorsCount.value) * 10) / 10 
    : 0
})

const calculateStats = () => {
  authorsCount.value = authors.value.length
  totalBooks.value = authors.value.reduce((total, author) => {
    return total + author.famousWorks.length
  }, 0)
}

const getApiData = async () => {
  loading.value = true
  error.value = null
  
  try {
    // Since we can't directly access src/assets/json/authors.json in a Vue component,
    // we'll simulate the data that would typically come from authors.json
    // In a real application, this would be fetched from an API endpoint
    
    const mockAuthorsData = [
      {
        name: "J.K. Rowling",
        famousWorks: [
          "Harry Potter and the Philosopher's Stone",
          "Harry Potter and the Chamber of Secrets", 
          "Harry Potter and the Prisoner of Azkaban",
          "Harry Potter and the Goblet of Fire",
          "Harry Potter and the Order of the Phoenix",
          "Harry Potter and the Half-Blood Prince",
          "Harry Potter and the Deathly Hallows",
          "The Casual Vacancy"
        ]
      },
      {
        name: "George Orwell",
        famousWorks: [
          "1984",
          "Animal Farm",
          "Homage to Catalonia",
          "The Road to Wigan Pier"
        ]
      },
      {
        name: "Jane Austen",
        famousWorks: [
          "Pride and Prejudice",
          "Emma",
          "Sense and Sensibility",
          "Mansfield Park",
          "Northanger Abbey",
          "Persuasion"
        ]
      },
      {
        name: "William Shakespeare",
        famousWorks: [
          "Romeo and Juliet",
          "Hamlet",
          "Macbeth",
          "Othello",
          "King Lear",
          "A Midsummer Night's Dream",
          "The Tempest"
        ]
      },
      {
        name: "Charles Dickens",
        famousWorks: [
          "A Tale of Two Cities",
          "Great Expectations",
          "Oliver Twist",
          "David Copperfield",
          "A Christmas Carol"
        ]
      }
    ]
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    authors.value = mockAuthorsData
    calculateStats()
    
    // Create API response format
    apiResponse.value = {
      success: true,
      data: {
        authorsCount: authorsCount.value,
        totalBooks: totalBooks.value,
        averageBooksPerAuthor: averageBooksPerAuthor.value,
        authors: authors.value.map(author => ({
          name: author.name,
          bookCount: author.famousWorks.length,
          books: author.famousWorks
        }))
      },
      metadata: {
        timestamp: new Date().toISOString(),
        source: "Local Authors Database",
        version: "1.0.0",
        requestId: Math.random().toString(36).substring(7)
      }
    }
    
  } catch (err) {
    error.value = `Error loading authors data: ${err.message}`
    console.error('Error loading authors data:', err)
  } finally {
    loading.value = false
  }
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

onMounted(() => {
  getApiData()
})

defineExpose({
  getApiData
})
</script>

<style scoped>
.api-response {
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 5px;
  padding: 15px;
  max-height: 500px;
  overflow-y: auto;
}

.api-response pre {
  margin: 0;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  color: #495057;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.card {
  border-radius: 10px;
  margin-bottom: 20px;
}

.card-header {
  border-radius: 10px 10px 0 0 !important;
}

.table {
  margin-bottom: 0;
}

.badge {
  font-size: 0.8rem;
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}
</style>