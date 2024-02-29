const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const serverSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  owner: { type: Schema.Types.ObjectId, ref: "People" },
  members: [
    {
      type: Schema.Types.ObjectId,
      ref: "People",
    },
  ],
  channels: [{ type: Schema.Types.ObjectId, ref: "Room" }],
  created_at: { type: Date, default: Date.now },
});

const Server = mongoose.model("Server", serverSchema);

module.exports = Server;
