/**
 * firebase.js — Firebase initialization + Google Auth
 *
 * Uses the user's Firebase project (fitcheckai-504db) for authentication.
 * Google sign-in popup flow — no redirect needed.
 */

import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBN_6hzDI8lrqFayz1m3Iy8JGtnkHFssZM",
  authDomain: "fitcheckai-504db.firebaseapp.com",
  projectId: "fitcheckai-504db",
  storageBucket: "fitcheckai-504db.firebasestorage.app",
  messagingSenderId: "380684388655",
  appId: "1:380684388655:web:86da14e2be8dd6485439da",
  measurementId: "G-4NKMDCVE74",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();

export async function signInWithGoogle() {
  return signInWithPopup(auth, provider);
}

export { signOut, onAuthStateChanged };
