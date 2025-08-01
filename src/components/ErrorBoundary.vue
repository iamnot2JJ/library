<template>
  <div v-if="hasError" class="error-boundary">
    <div class="alert alert-danger">
      <h4 class="alert-heading">Something went wrong!</h4>
      <p>{{ errorMessage }}</p>
      <hr>
      <button @click="retry" class="btn btn-outline-danger">
        Try Again
      </button>
    </div>
  </div>
  <slot v-else />
</template>

<script setup>
import { ref, onErrorCaptured } from 'vue'

const hasError = ref(false)
const errorMessage = ref('')

onErrorCaptured((error, instance, info) => {
  console.error('Error caught by boundary:', error, info)
  hasError.value = true
  errorMessage.value = error.message || 'An unexpected error occurred'
  return false
})

const retry = () => {
  hasError.value = false
  errorMessage.value = ''
  window.location.reload()
}
</script>

<style scoped>
.error-boundary {
  padding: 20px;
  margin: 20px 0;
}
</style>