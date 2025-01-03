// Socket.IO
const socket = io();

// Firebase Authentication
function loginUser() {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  auth.signInWithEmailAndPassword(email, password).then(() => {
    console.log("User logged in");
    showChatSelection();
  }).catch((err) => alert(err.message));
}

function registerUser() {
  const email = document.getElementById("registerEmail").value;
  const password = document.getElementById("registerPassword").value;

  auth.createUserWithEmailAndPassword(email, password).then((userCredential) => {
    db.collection("users").doc(userCredential.user.uid).set({
      email,
      avatarUrl: "https://example.com/avatar.glb", // Replace with actual avatar URL
    });
    alert("User registered successfully");
    showLoginPage();
  }).catch((err) => alert(err.message));
}

// Chat Functions
function joinPublicChat() {
  document.getElementById("chatSelectionPage").style.display = "none";
  document.getElementById("publicChatPage").style.display = "block";

  const chatDiv = document.getElementById("publicChatMessages");
  db.collection("publicChats").onSnapshot((snapshot) => {
    chatDiv.innerHTML = "";
    snapshot.forEach((doc) => {
      const message = doc.data();
      chatDiv.innerHTML += `<p><strong>${message.userName}:</strong> ${message.message}</p>`;
    });
  });
}

function sendPublicMessage() {
  const message = document.getElementById("publicChatInput").value;
  db.collection("publicChats").add({
    userName: auth.currentUser.email,
    message,
    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
  });
  document.getElementById("publicChatInput").value = "";
}

// Voice Chat Functions (WebRTC)
document.getElementById("startVoice").addEventListener("click", async () => {
  const localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  localStream.getTracks().forEach((track) => socket.emit("addTrack", track));
});

document.getElementById("stopVoice").addEventListener("click", () => {
  socket.emit("removeTrack");
});
