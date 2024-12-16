import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import {
  addDoc,
  collection,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB51Xx5xblhwbqez6forV-gXO7LwJmLwoA",
  authDomain: "chat-freely-b9daa.firebaseapp.com",
  projectId: "chat-freely-b9daa",
  storageBucket: "chat-freely-b9daa.firebasestorage.app",
  messagingSenderId: "533665648144",
  appId: "1:533665648144:web:fd3081fbff1ae5e23fc495",
  measurementId: "G-5T4E7ZDL7E",
};

function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

if (getQueryParam("from") === "index") {
  fetched();
}

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore();
const auth = getAuth();
const messagesRef = collection(db, "messages");
const startTimestamp = new Date();

const messagesQuery = query(
  messagesRef,
  where("timestamp", ">", startTimestamp),
  orderBy("timestamp"),
);

onSnapshot(messagesQuery, (snapshot) => {
  snapshot.docChanges().forEach((change) => {
    if (change.type === "added") {
      const message = change.doc.data();
      onChange(message);
    }
  });
});

const chatArea = document.querySelector("#chatArea");
const messageInput = document.querySelector("#messageInput");
const sendBtn = document.querySelector("#send");
sendBtn.addEventListener("click", sendMessage);

async function sendMessage() {
  const messageText = messageInput.value;
  const user = auth.currentUser;
  if (user && messageText.trim() !== "") {
    const date = new Date();
    try {
      await addDoc(messagesRef, {
        userId: user.uid,
        userName: user.displayName,
        message: messageText,
        timestamp: date,
      });
      addMessageToChat(messageText, user.displayName, date);
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  }
  messageInput.value = "";
}

function addMessageToChat(message, userName, timestamp) {
  const item = document.createElement("div");
  item.classList.add("flex", "justify-end");
  item.innerHTML = `
      <div class="bg-blue-500 p-3 rounded-lg shadow text-white">
                 <div class="text-sm text-gray-300">
          <span>${userName}</span> • <span>${new Date(timestamp).toLocaleString()}</span>
        </div>   
                    <p>${message}</p>
                </div>
    `;
  chatArea.appendChild(item);
}

function onChange(message) {
  const item = document.createElement("div");
  const isCurrentUser = message.userId === auth.currentUser.uid;
  if (!isCurrentUser) {
    item.classList.add("flex");

    item.innerHTML = `
          <div class="bg-gray-800 text-gray-200 p-3 rounded-lg shadow">
            <div class="text-sm text-gray-300">
              <span>${message.userName}</span> • <span>${new Date(message.timestamp.toDate()).toLocaleString()}</span>
            </div>
            <p>${message.message}</p>
          </div>
        `;
    chatArea.appendChild(item);
  }
}

function fetched() {
  console.log("fetched");
}
