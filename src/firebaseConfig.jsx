// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAODtYzaT9KxfbMNLITgnqT6neHHKpfmLo",
  authDomain: "funwithus-daf25.firebaseapp.com",
  projectId: "funwithus-daf25",
  storageBucket: "funwithus-daf25.appspot.com",
  messagingSenderId: "175496155833",
  appId: "1:175496155833:web:6bdec1ecc95ff3af024168"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db, RecaptchaVerifier, signInWithPhoneNumber };
