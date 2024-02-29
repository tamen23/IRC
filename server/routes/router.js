const express = require("express");
const route = express.Router();
const UserController = require("../controller/UserController");
const MessageController = require("../controller/MessageController");
const RoomController = require("../controller/RoomController");
const ServerController = require("../controller/ServerController");

// API

// User

route.post("/api/login", UserController.login);
route.post("/api/user", UserController.create);
route.get("/api/users", UserController.find);
route.get("/api/user/:id", UserController.findOne);
route.get("/api/check-email", UserController.checkEmail);
route.put("/api/user/:id", UserController.update);
route.delete("/api/user/:id", UserController.delete);

// Message

route.post("/api/message", MessageController.create);
route.get("/api/messages", MessageController.find);
route.get("/api/message/:id", MessageController.findOne);
route.put("/api/message/:id", MessageController.update);
route.delete("/api/message/:id", MessageController.delete);

// Server

route.post("/api/server", ServerController.create);
route.get("/api/servers", ServerController.find);
route.get("/api/server/:id", ServerController.findOne);
route.put("/api/server/:id", ServerController.update);
route.delete("/api/server/:id", ServerController.delete);

// Room

route.post("/api/room", RoomController.create);
route.get("/api/rooms", RoomController.find);
route.get("/api/room/:id", RoomController.findOne);
route.put("/api/room/:id", RoomController.update);
route.delete("/api/room/:id", RoomController.delete);

module.exports = route;
