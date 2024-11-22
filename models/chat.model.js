const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  message: {
    type: String, 
    required: true
  },
  isAdminReply: {
    type: Boolean, 
    default: false 
  },
  repliedTo: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Message", 
  },
  createdAt: {
    type: Date,
    default: Date.now 
  }
});

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
