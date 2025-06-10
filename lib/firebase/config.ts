// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// Pour la sécurité, ces informations devraient être stockées dans des variables d'environnement
// mais pour le développement, nous utilisons les valeurs directement
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCFgI75NOrUkOhQ8gMiZVp5TEyUzRiKV90",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "aximotravosaas.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "aximotravosaas",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "aximotravosaas.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "616366216373",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:616366216373:web:170ae1f640442f30019afc"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
