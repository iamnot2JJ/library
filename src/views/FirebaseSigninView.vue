<template>
  <div class="firebase-auth-container">
    <h1>Sign in</h1>
    <p><input type="text" placeholder="Email" v-model="email" /></p>
    <p><input type="password" placeholder="Password" v-model="password" /></p>
    <p><button @click="signin" class="auth-button">Sign in via Firebase</button></p>
    
    <!-- 添加注册链接 -->
    <p class="auth-link">
      Don't have an account? 
      <router-link to="/FireRegister" class="link-text">Register here</router-link>
    </p>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "vue-router";

const email = ref("");
const password = ref("");
const router = useRouter();
const auth = getAuth();

const signin = () => {
    signInWithEmailAndPassword(auth, email.value, password.value)
    .then((userCredential) => {
        console.log("Firebase Login Successful!");
        console.log("Current User:", userCredential.user.email); // 使用参数
        router.push("/");
    }).catch((error) => {
        console.log(error.code);
        alert(error.message);
    });
};
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