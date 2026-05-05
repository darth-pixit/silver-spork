// One-time Firebase setup (do this in your Firebase console, then fill in below):
//   1. console.firebase.google.com → Add project
//   2. Build → Authentication → Sign-in method → enable "Phone"
//   3. Build → Firestore Database → Create database (start in production mode)
//   4. Project settings → Your apps → Add web app → copy the config object below
//   5. Authentication → Settings → Authorized domains → add the domain you serve from
//      (localhost is allowed by default; add your prod host when you deploy)
//   6. Deploy firestore.rules:  firebase deploy --only firestore:rules
//      (or paste them into Firestore → Rules in the console)
//
// Note: phone OTP requires serving over http(s), not file://. Locally:
//   python3 -m http.server 8000   →  open http://localhost:8000

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

export const firebaseConfig = {
  apiKey: "REPLACE_ME",
  authDomain: "REPLACE_ME.firebaseapp.com",
  projectId: "REPLACE_ME",
  storageBucket: "REPLACE_ME.appspot.com",
  messagingSenderId: "REPLACE_ME",
  appId: "REPLACE_ME",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
