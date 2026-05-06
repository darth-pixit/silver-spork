// One-time Firebase setup:
//   1. Build → Firestore Database → Create database (production mode)
//   2. Build → Firestore → Rules → paste the contents of firestore.rules
//      (or run: firebase deploy --only firestore:rules)
//
// No Authentication setup needed — this app uses a join code as the secret
// instead of phone/email login.

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

export const firebaseConfig = {
  apiKey: "AIzaSyD3IIeucukA7BdgZ80iVF0Fw1grPt4cKxs",
  authDomain: "spork-ca095.firebaseapp.com",
  projectId: "spork-ca095",
  storageBucket: "spork-ca095.firebasestorage.app",
  messagingSenderId: "321032417484",
  appId: "1:321032417484:web:39e83cd99155ed54a8d269",
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
