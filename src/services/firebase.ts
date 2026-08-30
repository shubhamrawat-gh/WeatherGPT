import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDNCGsvx-HoHmlta4F7QbL7dyaPqAlAPpY",
  authDomain: "rescuelens-ai.firebaseapp.com",
  projectId: "rescuelens-ai",
  storageBucket: "rescuelens-ai.firebasestorage.app",
  messagingSenderId: "619746783175",
  appId: "1:619746783175:web:bd7e6dfbf31ab065d0f3e2",
  measurementId: "G-RQE0RN1V0Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics conditionally
const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;

// Initialize Firebase Auth
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { app, analytics, auth, googleProvider };
