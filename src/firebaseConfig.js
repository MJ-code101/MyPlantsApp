// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDg2GG58mSOeYAGPS-DZzresVUJ4wjYRTg",
  authDomain: "myplantapp-1881f.firebaseapp.com",
  projectId: "myplantapp-1881f",
  storageBucket: "myplantapp-1881f.firebasestorage.app",
  messagingSenderId: "1051776175449",
  appId: "1:1051776175449:web:b953261176c83ffc341048",
  measurementId: "G-7LN8VM72WY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const firestore = getFirestore(app);

export { firestore };