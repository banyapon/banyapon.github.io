const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // WebRTC Signaling
  socket.on("offer", (data) => {
    socket.to(data.target).emit("offer", { sdp: data.sdp, sender: socket.id });
  });

  socket.on("answer", (data) => {
    socket.to(data.target).emit("answer", { sdp: data.sdp, sender: socket.id });
  });

  socket.on("candidate", (data) => {
    socket.to(data.target).emit("candidate", { candidate: data.candidate, sender: socket.id });
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

server.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
