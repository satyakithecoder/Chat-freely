import {getAnalytics} from "firebase/analytics";
import {initializeApp} from "firebase/app";
import { getFirestore, collection, addDoc} from "firebase/firestore";
import { getAuth } from "firebase/auth";
const firebaseConfig = {
    apiKey: "AIzaSyB51Xx5xblhwbqez6forV-gXO7LwJmLwoA",
    authDomain: "chat-freely-b9daa.firebaseapp.com",
    projectId: "chat-freely-b9daa",
    storageBucket: "chat-freely-b9daa.firebasestorage.app",
    messagingSenderId: "533665648144",
    appId: "1:533665648144:web:fd3081fbff1ae5e23fc495",
    measurementId: "G-5T4E7ZDL7E"
};
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app)
const db = getFirestore();
const auth = getAuth();


const messagesRef = collection(db, "messages");

const chatArea = document.querySelector("#chatArea")
const messageInput = document.querySelector("#messageInput")
const sendBtn = document.querySelector("#send")
sendBtn.addEventListener("click", sendMessage)
async function sendMessage() {
    const messageText = messageInput.value;
    const user = auth.currentUser;
    if (user && messageText.trim() !== "") {
        try {
            await addDoc(messagesRef, {
                userId: user.uid,
                userName: user.displayName,
                message: messageText,
                timestamp: new Date()
            });
            addMessageToChat(messageText);
        } catch (error) {
            console.error("Error adding document: ", error);
        }
    }
    messageInput.value = "";
}
function addMessageToChat(message) {
    const item = document.createElement("div");
    item.classList.add("flex", "justify-end")
    item.innerHTML = `
      <div class="bg-blue-500 p-3 rounded-lg shadow text-white">
                    <p>${message}</p>
                </div>
    `
    chatArea.appendChild(item);
}
