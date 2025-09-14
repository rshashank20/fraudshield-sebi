import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Import your Firebase config
// Make sure to copy firebaseConfig.example.js to firebaseConfig.js and add your config
let firebaseConfig;
try {
  firebaseConfig = require('../firebaseConfig.js').default;
} catch (error) {
  console.error('Firebase config not found. Please copy firebaseConfig.example.js to firebaseConfig.js and add your configuration.');
  // Fallback config for development
  firebaseConfig = {
    apiKey: "demo-key",
    authDomain: "demo.firebaseapp.com",
    projectId: "demo-project",
    storageBucket: "demo-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "demo-app-id"
  };
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;
