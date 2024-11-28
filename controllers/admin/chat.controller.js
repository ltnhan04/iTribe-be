const { getMessages, sendAdminReply } = require('../chat.controller');

const getAllMessages = async (req, res) => {
  try {
    const messages = await getMessages(); 
    res.status(200).json({ messages });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const sendReply = async (req, res) => {
    try {
      const userId = req.user._id.toString(); 
      const { message } = req.body;
      await sendAdminReply(userId, message); 
      res.status(200).json({ message: 'Reply sent successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
module.exports = {
  getAllMessages, 
  sendReply,
};
