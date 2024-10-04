// Import the necessary functions from Firebase SDK and AsyncStorage
import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDJRGECcxoThWXTrwHx8gOeCLRRvSt1BxQ",
  authDomain: "tenant-reviewing-app-5628c.firebaseapp.com",
  projectId: "tenant-reviewing-app-5628c",
  storageBucket: "tenant-reviewing-app-5628c.appspot.com",
  messagingSenderId: "528231955805",
  appId: "1:528231955805:web:705975e72a5158b172bcb4",
  measurementId: "G-YZQEL6R16S"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication, but only if it hasn't been initialized already
let auth;
try {
  auth = getAuth(app);
} catch (error) {
  if (error.code === 'auth/already-initialized') {
    // Firebase Auth has already been initialized, do nothing
  } else {
    // Initialize Firebase Auth with AsyncStorage persistence
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  }
}

// Initialize Firestore for database usage
const db = getFirestore(app);

// Initialize Firebase Storage for file uploads
const storage = getStorage(app);

// Export the Firebase instances to be used across the app
export { db, auth, storage };
