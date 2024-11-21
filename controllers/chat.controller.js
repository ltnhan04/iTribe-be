const Message = require('../models/chat.model');

// Gửi tin nhắn từ người dùng
exports.sendMessage = async (req, res) => {
    try {
        const { message } = req.body;
        const userId = req.user._id.toString(); 
        
        if (!message || message.trim() === '') {
            return res.status(400).json({ message: 'Message cannot be empty' });
        }

        const newMessage = new Message({
            userId,
            message,
            sender: 'user',
        });

        await newMessage.save();
        return res.status(200).json({ message: 'Message sent successfully', data: newMessage });
    } catch (error) {
        console.error('Error sending message:', error);
        return res.status(500).json({ message: 'Error sending message', error: error.message });
    }
};

// Lấy tất cả tin nhắn của người dùng
exports.getMessages = async (req, res) => {
    try {
        const userId = req.user._id.toString();
        const messages = await Message.find({ userId }).sort({ createdAt: 1 });

        if (!messages || messages.length === 0) {
            return res.status(404).json({ message: 'No messages found' });
        }

        return res.status(200).json({
            messages: messages.map((msg) => ({
                userId: msg.userId,
                message: msg.message,
                sender: 'user',
                createdAt: msg.createdAt,
            })),
        });
    } catch (error) {
        console.error('Error fetching messages:', error);
        return res.status(500).json({ message: 'Error fetching messages', error: error.message });
    }
};

// // Gửi phản hồi từ admin
// exports.sendAdminReply = async (req, res) => {
//     try {
//         const { message } = req.body;
//         const userId = req.user._id.toString(); 

//         if (!message || message.trim() === '') {
//             return res.status(400).json({ message: 'Reply message cannot be empty' });
//         }

//         const newReply = new Message({
//             userId,
//             message,
//             sender: 'admin',
//         });

//         await newReply.save();
//         return res.status(200).json({
//             message: 'Admin reply sent successfully',
//             data: {
//                 userId: newReply.userId,
//                 message: newReply.message,
//                 sender: newReply.sender,
//                 createdAt: newReply.createdAt,
//             },
//         });
//     } catch (error) {
//         console.error('Error sending admin reply:', error);
//         return res.status(500).json({ message: 'Error sending reply', error: error.message });
//     }
// };
