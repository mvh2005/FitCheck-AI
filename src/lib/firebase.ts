// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBN_6hzDI8lrqFayz1m3Iy8JGtnkHFssZM",
  authDomain: "fitcheckai-504db.firebaseapp.com",
  projectId: "fitcheckai-504db",
  storageBucket: "fitcheckai-504db.firebasestorage.app",
  messagingSenderId: "380684388655",
  appId: "1:380684388655:web:86da14e2be8dd6485439da",
  measurementId: "G-4NKMDCVE74"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);