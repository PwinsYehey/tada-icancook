import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyC4Jq9qxnze23WyZ_9gSFsWY3hKfbtY-u0",
  authDomain: "tada-i-can-cook.firebaseapp.com",
  projectId: "tada-i-can-cook",
  storageBucket: "tada-i-can-cook.firebasestorage.app",
  messagingSenderId: "1070410157625",
  appId: "1:1070410157625:web:1c20438a96ec573eea47e8"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

