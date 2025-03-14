// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth'; // Import required methods
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage

const firebaseConfig = {
  apiKey: "AIzaSyDg2GG58mSOeYAGPS-DZzresVUJ4wjYRTg",
  authDomain: "myplantapp-1881f.firebaseapp.com",
  projectId: "myplantapp-1881f",
  storageBucket: "myplantapp-1881f.firebasestorage.app",
  messagingSenderId: "1051776175449",
  appId: "1:1051776175449:web:b953261176c83ffc341048",
  measurementId: "G-7LN8VM72WY"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Check if Auth is already initialized
let auth;
try {
  auth = getAuth(app); // Try to get the existing Auth instance
} catch (error) {
  // If not initialized, initialize Auth with AsyncStorage persistence
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
  });
}

export { auth };