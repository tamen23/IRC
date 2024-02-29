const Room = require("../model/RoomModel");
const Message = require("../model/MessageModel");

function setupSocket(server) {
  const io = require("socket.io")(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    socket.on("sendMessage", async (messageData) => {
      try {
        const savedMessage = new Message(messageData);
        await savedMessage.save();

        const roomId = messageData.roomId;

        await Room.findByIdAndUpdate(roomId, {
          $push: { messages: savedMessage._id },
        });

        io.emit("newMessage", savedMessage);

        console.log(
          `Updating room: ${roomId} with message: ${savedMessage._id}`
        );
      } catch (error) {
        console.error("Error processing message:", error);
      }
    });
  });
}

module.exports = setupSocket;
