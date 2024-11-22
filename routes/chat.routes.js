const express = require('express');
const router = express.Router();  
const authenticateToken = require('../middleware/auth.middleware');
const chatController = require('../controllers/chat.controller');

// Route gửi tin nhắn từ người dùng
router.post('/send', authenticateToken.verifyToken, chatController.sendMessage);

// Route lấy tin nhắn của người dùng
router.get('/messages', authenticateToken.verifyToken, chatController.getMessages);

// Route gửi phản hồi từ admin
// router.post('/admin/reply', chatController.sendAdminReply);

// Export router để có thể sử dụng trong app.js
module.exports = router;
