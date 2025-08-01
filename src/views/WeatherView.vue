<template>
  <div class="container mt-4">
    <div class="header text-center mb-4">
      <h1 class="display-4 text-primary">🌤️ WEATHER APP</h1>
      <div class="search-bar">
        <div class="row justify-content-center">
          <div class="col-md-6">
            <div class="input-group mb-3">
              <input 
                type="text" 
                v-model="city"
                placeholder="Enter city name (e.g., Clayton, AU)"
                class="form-control form-control-lg"
                @keyup.enter="searchByCity"
              />
              <button 
                @click="searchByCity" 
                class="btn btn-primary btn-lg"
                :disabled="loading"
              >
                <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                🔍 Search
              </button>
            </div>
          </div>
        </div>
        
        <!-- Current Location Button -->
        <div class="text-center mb-4">
          <button 
            @click="fetchCurrentLocationWeather" 
            class="btn btn-success"
            :disabled="loading"
          >
            <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
            📍 Get Current Location Weather
          </button>
        </div>

        <!-- API Statistics -->
        <div v-if="apiStats" class="alert alert-info">
          <h6 class="alert-heading">📊 API Statistics</h6>
          <div class="row">
            <div class="col-md-6">
              <strong>Total Authors:</strong> {{ apiStats.authorsCount }}
            </div>
            <div class="col-md-6">
              <strong>Total Books:</strong> {{ apiStats.totalBooks }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error Display -->
    <div v-if="error" class="alert alert-danger text-center">
      <h5 class="alert-heading">❌ Error</h5>
      <p class="mb-0">{{ error }}</p>
    </div>

    <!-- Weather Display -->
    <main>
      <div v-if="weatherData" class="weather-card">
        <div class="card shadow-lg">
          <div class="card-header bg-primary text-white text-center">
            <h2 class="mb-0">
              📍 {{ weatherData.name }}, {{ weatherData.sys.country }}
            </h2>
          </div>
          <div class="card-body text-center">
            <div class="weather-icon-temp mb-3">
              <img :src="iconUrl" alt="Weather Icon" class="weather-icon" />
              <h1 class="temperature text-primary">{{ temperature }}°C</h1>
            </div>
            
            <div class="weather-description mb-4">
              <h4 class="text-capitalize">{{ weatherData.weather[0].description }}</h4>
            </div>

            <!-- Additional Weather Details -->
            <div class="row weather-details">
              <div class="col-md-3 mb-2">
                <div class="detail-card">
                  <h6>💨 Wind</h6>
                  <p>{{ weatherData.wind.speed }} m/s</p>
                </div>
              </div>
              <div class="col-md-3 mb-2">
                <div class="detail-card">
                  <h6>💧 Humidity</h6>
                  <p>{{ weatherData.main.humidity }}%</p>
                </div>
              </div>
              <div class="col-md-3 mb-2">
                <div class="detail-card">
                  <h6>🌡️ Feels Like</h6>
                  <p>{{ Math.round(weatherData.main.feels_like) }}°C</p>
                </div>
              </div>
              <div class="col-md-3 mb-2">
                <div class="detail-card">
                  <h6>🏔️ Pressure</h6>
                  <p>{{ weatherData.main.pressure }} hPa</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

const apikey = import.meta.env.VITE_WEATHER_API_KEY || "0abc67682f4d9e308cb3f1446ba24aef"
const city = ref("")
const weatherData = ref(null)
const loading = ref(false)
const error = ref(null)
const apiStats = ref(null)

// Computed properties
const temperature = computed(() => {
  return weatherData.value
    ? Math.round(weatherData.value.main.temp) // Already in Celsius when using units=metric
    : null
})

const iconUrl = computed(() => {
  return weatherData.value
    ? `https://openweathermap.org/img/w/${weatherData.value.weather[0].icon}.png`
    : null
})

// Load API statistics on mount
onMounted(async () => {
  await loadApiStats()
  await fetchCurrentLocationWeather()
})

// Load authors and books statistics
const loadApiStats = async () => {
  try {
    // Since we can't directly fetch from src/assets, we'll simulate the data
    // In a real app, this would come from your API endpoint
    const mockAuthorsData = [
      { name: "J.K. Rowling", famousWorks: ["Harry Potter Series", "The Casual Vacancy"] },
      { name: "George Orwell", famousWorks: ["1984", "Animal Farm"] },
      { name: "Jane Austen", famousWorks: ["Pride and Prejudice", "Emma", "Sense and Sensibility"] }
    ]
    
    const authorsCount = mockAuthorsData.length
    const totalBooks = mockAuthorsData.reduce((total, author) => {
      return total + author.famousWorks.length
    }, 0)
    
    apiStats.value = {
      authorsCount,
      totalBooks
    }
  } catch (err) {
    console.error('Error loading API stats:', err)
  }
}

// Search weather by city
const searchByCity = async () => {
  if (!city.value.trim()) {
    error.value = "Please enter a city name"
    return
  }
  
  loading.value = true
  error.value = null
  
  try {
    // Use HTTPS and add units=metric for Celsius
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city.value)}&appid=${apikey}&units=metric`
    await fetchWeatherData(url)
  } catch (err) {
    error.value = `Error fetching weather for ${city.value}: ${err.message}`
  } finally {
    loading.value = false
  }
}

// Get current location weather
const fetchCurrentLocationWeather = async () => {
  if (navigator.geolocation) {
    loading.value = true
    error.value = null
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords
          // Use HTTPS and add units=metric for Celsius
          const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apikey}&units=metric`
          await fetchWeatherData(url)
        } catch (err) {
          error.value = `Error fetching current location weather: ${err.message}`
        } finally {
          loading.value = false
        }
      },
      (err) => {
        loading.value = false
        error.value = "Unable to retrieve your location. Please search by city name."
        console.error("Geolocation error:", err)
      }
    )
  } else {
    error.value = "Geolocation is not supported by this browser."
  }
}

// Fetch weather data from API
const fetchWeatherData = async (url) => {
  try {
    console.log('Fetching weather data from:', url)
    const response = await fetch(url)
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('API Error Response:', errorData)
      
      if (response.status === 401) {
        throw new Error('Invalid API key. Please check your OpenWeatherMap API key.')
      } else if (response.status === 404) {
        throw new Error('City not found. Please check the city name and try again.')
      } else {
        throw new Error(`HTTP error! status: ${response.status} - ${errorData.message || 'Unknown error'}`)
      }
    }
    
    const data = await response.json()
    console.log('Weather data received:', data)
    weatherData.value = data
    
  } catch (err) {
    console.error('Fetch error:', err)
    throw new Error(`Failed to fetch weather data: ${err.message}`)
  }
}
</script>

<style scoped>
.weather-card {
  max-width: 600px;
  margin: 0 auto;
}

.weather-icon-temp {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.weather-icon {
  width: 100px;
  height: 100px;
}

.temperature {
  font-size: 3rem;
  font-weight: bold;
  margin: 0;
}

.weather-description h4 {
  font-weight: 500;
  color: #6c757d;
}

.detail-card {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 10px;
  border: 1px solid #dee2e6;
}

.detail-card h6 {
  margin-bottom: 8px;
  color: #495057;
  font-weight: 600;
}

.detail-card p {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 500;
}

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

.input-group .form-control {
  border-radius: 25px 0 0 25px;
}

.input-group .btn {
  border-radius: 0 25px 25px 0;
}
</style>