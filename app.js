const createError = require("http-errors");
const express = require("express");
const app = express();
const path = require("path");
const logger = require("morgan");
const http = require("http").Server(app);
const io = require("socket.io")(http);
const cors = require("cors");

app.use(cors());
app.use(express.json());
app.use(logger("dev"));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

app.post("/graph", function (req, res) {
  let stt = req.body.data;
  io.emit("graph", stt);
  res.end();
});

app.post("/event", function (req, res) {
  let state = req.body.data;
  io.emit("event", state);
  res.end();
});

io.on("connection", function (socket) {
  console.log("a user connected");
  socket.on("disconnect", function () {
    console.log("user disconnected");
  });
});

http.listen(5000, function () {
  console.log("listening on: 5000");
});

module.exports = app;
