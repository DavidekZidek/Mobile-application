import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBP_UfqAacW5q_8ndhmWQ5ULpSuIkwkZgU",
  authDomain: "cryptoapp-35ea9.firebaseapp.com",
  projectId: "cryptoapp-35ea9",
  storageBucket: "cryptoapp-35ea9.appspot.com",
  messagingSenderId: "518072418280",
  appId: "1:518072418280:web:c09cdbff2757aa39ceee5d",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app); // Export Firestore
export const auth = getAuth(app); // Export Authentication
