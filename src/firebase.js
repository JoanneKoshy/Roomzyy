// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth"; // Import Firebase Authentication

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCFeQa6YoGaFQEWNsbeRKlj-NTBrKmnoUo",
  authDomain: "mustoog-918b5.firebaseapp.com",
  projectId: "mustoog-918b5",
  storageBucket: "mustoog-918b5.firebasestorage.app",
  messagingSenderId: "452334689963",
  appId: "1:452334689963:web:16691b9856ee9ae34ea1ee",
  measurementId: "G-TEW72DX38B"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Firestore init
const db = getFirestore(app);

// ✅ Authentication init
const auth = getAuth(app);  // Initialize Firebase Authentication

// Export db and auth
export { db, auth };
