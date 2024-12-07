const ChatService = require("../services/customer/chat.service");

const sendMessage = async (req, res, next) => {
  try {
    const { message } = req.body;

    const newMessage = await ChatService.handleSendMessage(
      message,
      req.user._id
    );
    return res
      .status(200)
      .json({ message: "Message sent successfully", data: newMessage });
  } catch (error) {
    next(error);
  }
};

const getMessages = async (req, res, next) => {
  try {
    const messages = await ChatService.handleGetMessages(req.user._id);

    return res.status(200).json({
      messages,
    });
  } catch (error) {
    next(error);
  }
};
module.exports = { sendMessage, getMessages };
