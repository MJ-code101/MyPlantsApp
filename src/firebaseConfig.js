import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth'; // Import persistence methods
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

// Initialize Firebase Auth with AsyncStorage Persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

export { auth };
