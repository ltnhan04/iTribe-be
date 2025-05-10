# 🚀 iTribe Backend API

<div align="center">

<img src="https://skillicons.dev/icons?i=nodejs,express,mongodb,redis" alt="tech stack" />

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge)](http://makeapullrequest.com)

</div>


## 📝 Overview
iTribe Backend is a robust, scalable, and secure RESTful API service built with Node.js and Express. It serves as the backbone for the iTribe e-commerce platform, providing powerful features for product management, user authentication, payment processing, and real-time communication.

## 🛠️ Tech Stack
- ⚡ **Runtime**: Node.js
- 🎯 **Framework**: Express.js
- 💾 **Database**: MongoDB with Mongoose ODM
- 🔄 **Cache**: Redis
- 📡 **Real-time**: Socket.IO
- 🔐 **Authentication**: 
  - 🔑 JWT (JSON Web Tokens)
  - 🔄 Access Token & Refresh Token mechanism
  - 🚫 Token rotation and revocation
  - 🛡️ Passport.js
  - 🌐 Google OAuth 2.0
- 💳 **Payment**: Stripe, Momo
- ☁️ **Storage**: Cloudinary
- 📧 **Email**: Nodemailer
- 🤖 **AI**: Google Generative AI

## ✨ Features

### 🔐 Authentication & Authorization
- 🔑 JWT-based authentication with Access & Refresh tokens
- 🔄 Automatic token refresh mechanism
- 🚫 Token blacklisting for logout
- 💾 Session management with Redis
- 🌐 Google OAuth 2.0 integration
- 👥 Role-based access control (Admin, User)
- 🔄 Password reset via email
- ✅ Account verification

### 👥 User Management
- 👤 User registration and login
- 👤 Profile management
- 📍 Address management
- 📦 Order history

### 📦 Product Management
- 📝 CRUD operations for products
- 📑 Category management
- 📊 Inventory tracking
- 🔄 Product variants
- 🔍 Product search and filtering
- ⭐ Product reviews and ratings
- 🤖 Product recommendations using AI

### 🛍️ Shopping Experience
- 🛒 Shopping cart management
- 📦 Order processing
- 🚚 Multiple shipping methods
- 📱 Order tracking
- 🏷️ Discount management

### 💳 Payment Processing
- 💳 Secure Stripe, Momo integration
- 💰 Multiple payment methods
- 📊 Transaction management

### 💬 Live chat support

### 📧 Email Notifications
- 📦 Order confirmations
- 🚚 Shipping updates
- 🔄 Password reset
- ✅ Account verification

### 🤖 AI Integration
- 🤖 Product recommendations
- 💬 Chatbot support

### 📊 Analytics & Reporting
- 📈 Sales analytics
- 💰 Revenue reports

### 🔒 Security Features
- ⏱️ Rate limiting
- 🛡️ CORS protection
- ✅ Input validation
- 🛡️ XSS protection
- 🚫 SQL injection prevention
- 🔒 Secure password hashing with bcrypt
- ✅ Request validation
- ⚠️ Error handling


## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
Made with ❤️ by the iTribe Team
</div>

