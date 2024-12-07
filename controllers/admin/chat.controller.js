const ChatService = require("../../services/admin/chat.service");

const getAllMessages = async (_, res, next) => {
  try {
    const messages = await ChatService.handleGetMessages();
    res.status(200).json({ messages });
  } catch (error) {
    next(error);
  }
};

const sendReply = async (req, res, next) => {
  try {
    const { message } = req.body;
    const reply = await ChatService.handleSendReply(message, req.user._id);
    res.status(200).json({ message: "Reply sent successfully", reply });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllMessages,
  sendReply,
};
