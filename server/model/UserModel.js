const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const peopleSchema = new Schema({
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: ["user", "admin"],
    default: "user",
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  friends: [
    {
      friendId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "People",
      },
      status: {
        type: String,
        enum: ["pending", "accepted", "rejected"],
        default: "pending",
      },
    },
  ],
  rooms: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
    },
  ],
  servers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Server",
    },
  ],
  nicknames: [
    {
      server: { type: Schema.Types.ObjectId, ref: "Server" },
      nickname: { type: String, required: true },
    },
  ],
});

const People = mongoose.model("People", peopleSchema);

People.init()
  .then(() => {
    console.log("Les index ont été créés ou reconstruits");
  })
  .catch((err) => {
    console.error("Erreur lors de la création des index :", err);
  });

module.exports = People;
