const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();

const allowedOrigins = [
    "http://localhost:5173",
    "https://saloon-umber-theta.vercel.app",

];

app.use(
    cors({
        origin: allowedOrigins,
    })
);

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
    },
});

let onlineUsers = 0;

io.on("connection", (socket) => {
    onlineUsers++;

    console.log("User connected");
    console.log("Online users:", onlineUsers);

    io.emit("onlineUsers", onlineUsers);

    socket.on("disconnect", () => {
        onlineUsers--;

        console.log("User disconnected");
        console.log("Online users:", onlineUsers);

        io.emit("onlineUsers", onlineUsers);
    });
});

app.get("/", (req, res) => {
    res.send("Saloon server is running");
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});