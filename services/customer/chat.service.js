const Chat = require("../../models/chat.model");
const AppError = require("../../helpers/appError.helper");

class ChatService {
  static handleSendMessage = async (message, userId) => {
    if (!message || message.trim() === "") {
      throw new AppError("Message cannot be empty", 400);
    }

    const newMessage = new Chat({
      userId,
      message,
      sender: "user",
    });

    await newMessage.save();
    return newMessage;
  };

  static handleGetMessages = async (userId) => {
    const messages = await Chat.find({ userId }).sort({ createdAt: 1 });

    if (!messages || messages.length === 0) {
      throw new AppError("No messages found", 404);
    }
    return messages;
  };
}

module.exports = ChatService;
