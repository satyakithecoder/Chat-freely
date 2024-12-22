import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-analytics.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import {
  addDoc,
  collection,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";
import {
  get,
  getDatabase,
  onDisconnect,
  onValue,
  ref,
  set,
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";

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
const db = getFirestore();
const realtimeDB = getDatabase(app);
const auth = getAuth();
const messagesRef = collection(db, "messages");
const startTimestamp = new Date();

function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

if (getQueryParam("from") === "index") {
  fetched();
}

auth.onAuthStateChanged((user) => {
  if (user) {
    const userId = user.uid;
    const userStatusDatabaseRef = ref(realtimeDB, "status/" + userId);
    set(userStatusDatabaseRef, { state: "online" })
      .then(() => {
        console.log("User status set to online");
      })
      .catch((error) => {
        console.error("Error setting user status:", error);
      });
    onDisconnect(userStatusDatabaseRef)
      .set({ state: "offline" })
      .then(() => {
        console.log("User status will be set to offline on disconnect");
      })
      .catch((error) => {
        console.error("Error setting up onDisconnect:", error);
      });
  }
});

onValue(
  ref(realtimeDB, "status/"),
  (snapshot) => {
    if (snapshot.exists()) {
      updateUserCount()
        .then((r) => console.log(r))
        .catch((e) => console.error(e));
    }
  },
  (error) => {
    console.error("Error listening for user status changes:", error);
  },
);

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
messageInput.addEventListener("keyup", (event) => {
  if (event.key === "Enter") {
    sendMessage();
  }
});

async function sendMessage() {
  const messageText = messageInput.value;
  const user = auth.currentUser;
  const userStatusDatabaseRef = ref(realtimeDB, "status/" + user.uid);
  if (user && messageText.trim() !== "") {
    const date = new Date();
    try {
      await set(userStatusDatabaseRef, { state: "online" });
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
<!--            .toDate() is used to convert firestroe time object in javascript object-->
              <span>${message.userName}</span> • <span>${new Date(message.timestamp.toDate()).toLocaleString()}</span>
            </div>
            <p>${message.message}</p>
          </div>
        `;
    chatArea.appendChild(item);
  }
}

function fetched() {
  const messagesQuery = query(
    messagesRef,
    where("timestamp", "<", startTimestamp),
    orderBy("timestamp"),
  );

  onSnapshot(messagesQuery, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === "added") {
        const message = change.doc.data();
        if (message.userId === auth.currentUser.uid) {
          addMessageToChat(
            message.message,
            message.userName,
            message.timestamp.toDate(),
          );
        } else {
          onChange(message);
        }
      }
    });
  });
}

async function updateUserCount() {
  const userDatabaseRef = ref(realtimeDB, "status/");
  let counter = 0;
  await get(userDatabaseRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        const users = snapshot.val();
        const usersArray = Object.entries(users);
        usersArray.forEach((element) => {
          if (element[1].state === "online") {
            counter++;
          }
        });
      } else {
        console.log("No users found.");
      }
    })
    .catch((error) => {
      console.error("Error getting user status:", error);
    });
  document.getElementById("activeUsers").innerHTML = `${counter}`;
}
