<template>
  <div class="firebase-auth-container">
    <h1>Create an Account</h1>
    <p><input type="text" placeholder="Email" v-model="email" /></p>
    <p><input type="password" placeholder="Password" v-model="password" /></p>
    <p><button @click="register" class="auth-button">Save to Firebase</button></p>
    

    <p class="auth-link">
      Already have an account? 
      <router-link to="/FireLogin" class="link-text">Sign in here</router-link>
    </p>
  </div>
</template>

<script setup>
import { ref } from "vue"
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth"
import { useRouter } from "vue-router"

const email = ref("")
const password = ref("")
const router = useRouter()
const auth = getAuth()

const register = () => {
  createUserWithEmailAndPassword(auth, email.value, password.value)
    .then((userCredential) => {
      console.log("Firebase Register Successful!")
      console.log("User:", userCredential.user.email) 
      router.push("/FireLogin")
    })
    .catch((error) => {
      console.log(error.code)
      alert(error.message)
    })
}
</script>

<style scoped>
.firebase-auth-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  text-align: center;
}

.firebase-auth-container h1 {
  margin-bottom: 20px;
}

.firebase-auth-container input {
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.auth-button {
  background-color: #42b983;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.auth-button:hover {
  background-color: #369f6b;
}

.auth-link {
  margin-top: 20px;
  font-size: 14px;
  color: #666;
}

.link-text {
  color: #42b983;
  text-decoration: none;
}

.link-text:hover {
  color: #369f6b;
  text-decoration: underline;
}
</style>