import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

export const firebaseConfig = {
  apiKey: "AIzaSyAtQiA2YnMurhbJ7_tlA6VgOGvTI6x3Cp8",
  authDomain: "kemerovo-42-4ba67.firebaseapp.com",
  projectId: "kemerovo-42-4ba67",
  storageBucket: "kemerovo-42-4ba67.firebasestorage.app",
  messagingSenderId: "664125425786",
  appId: "1:664125425786:web:80e9d5de247952eaaf13c3",
  measurementId: "G-HCE9BTKC5V"
};

// Инициализируем ТОЛЬКО ОДИН РАЗ для всего проекта
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
