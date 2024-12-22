import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-analytics.js";
import {
  getAuth,
  GithubAuthProvider,
  GoogleAuthProvider,
  signInWithPopup,
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { doc, getFirestore, setDoc } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB51Xx5xblhwbqez6forV-gXO7LwJmLwoA",
  authDomain: "chat-freely-b9daa.firebaseapp.com",
  projectId: "chat-freely-b9daa",
  storageBucket: "chat-freely-b9daa.firebasestorage.app",
  databaseURL:
    "https://chat-freely-b9daa-default-rtdb.asia-southeast1.firebasedatabase.app/",
  messagingSenderId: "533665648144",
  appId: "1:533665648144:web:fd3081fbff1ae5e23fc495",
  measurementId: "G-5T4E7ZDL7E",
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const providerGoogle = new GoogleAuthProvider();
const providerGithub = new GithubAuthProvider();
const google = document.getElementById("google-sign-in");
google.addEventListener("click", () => {
  signInWithPopup(auth, providerGoogle)
    .then((result) => {
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential.accessToken;
      const user = result.user;
      setDoc(doc(db, "google", `${user.uid}`), {
        name: user.displayName,
        email: user.email,
      })
        .then(() => {
          console.log("User data saved successfully!");
        })
        .catch((error) => {
          console.error("Error saving user data:", error);
        });
      window.location.replace("chat.html?from=index");
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      const email = error.customData.email;
      const credential = GoogleAuthProvider.credentialFromError(error);
    });
});
document.getElementById("github-sign-in").addEventListener("click", () => {
  signInWithPopup(auth, providerGithub)
    .then((result) => {
      const credential = GithubAuthProvider.credentialFromResult(result);
      const token = credential.accessToken;
      const user = result.user;
      setDoc(doc(db, "github", `${user.uid}`), {
        name: user.displayName,
      })
        .then(() => {
          console.log("User data saved successfully!");
        })
        .catch((error) => {
          console.error("Error saving user data:", error);
        });
      window.location.replace("chat.html?from=index");
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      const email = error.customData.email;
      const credential = GithubAuthProvider.credentialFromError(error);
    });
});
