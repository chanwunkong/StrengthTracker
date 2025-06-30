// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Firebase 設定
const firebaseConfig = {
  apiKey: "AIzaSyAI5lx2XT3ysBhTREBW637s_AlWC49LYJQ",
  authDomain: "test-5dbba.firebaseapp.com",
  projectId: "test-5dbba",
  storageBucket: "test-5dbba.appspot.com",
  messagingSenderId: "878665537417",
  appId: "1:878665537417:web:0c5b32f6a01ff9df803358",
  measurementId: "G-NFM5EEWYHP"
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();

export { auth, db, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, doc, setDoc, getDoc };