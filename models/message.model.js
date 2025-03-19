const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  conversation_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Conversation",
    required: true,
  },
  message: { type: String, required: true },
  is_reply: { type: Boolean, default: false },
  image: { type: String, default: null },
});

module.exports = mongoose.model("Message", messageSchema);
