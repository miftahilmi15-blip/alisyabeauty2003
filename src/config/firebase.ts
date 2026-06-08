import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

export const firebaseConfig = {
  apiKey: "AIzaSyB_YeVJv-1a7ij3XWdhxA8g07ip1xaqISY",
  authDomain: "salon-12993.firebaseapp.com",
  databaseURL: "https://salon-12993-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "salon-12993",
  storageBucket: "salon-12993.firebasestorage.app",
  messagingSenderId: "382651324725",
  appId: "1:382651324725:web:9be2540b08a2f82360d47c",
  measurementId: "G-9WKWTR9QZ6"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
export { app };
