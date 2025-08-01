// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyADSa5JzT8GV4GoyIzZRN8kw6DSLo7K7eU",
  authDomain: "week7-junjie-zhou.firebaseapp.com",
  projectId: "week7-junjie-zhou",
  storageBucket: "week7-junjie-zhou.firebasestorage.app",
  messagingSenderId: "618136513903",
  appId: "1:618136513903:web:0beab0074945d605f70c9a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default db;