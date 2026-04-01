// Import the functions you need from the SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

// Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyCMol5W6IH4eLyfdVjXArtzZeYY2NAd130",
    authDomain: "bmb-electronics-c511b.firebaseapp.com",
    databaseURL: "https://bmb-electronics-c511b-default-rtdb.firebaseio.com",
    projectId: "bmb-electronics-c511b",
    storageBucket: "bmb-electronics-c511b.firebasestorage.app",
    messagingSenderId: "578254565269",
    appId: "1:578254565269:web:9f8459788755c6573d509c",
    measurementId: "G-V63FS53751"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
