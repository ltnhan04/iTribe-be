const Notification = require("../../models/notification.model")


const getAllNotifications = async (req, res) => {
    try {
      // Fetch all notifications, sorted by creation date (latest first)
      const notifications = await Notification.find().sort({ createdAt: -1 });
  
      // Respond with the list of notifications
      res.status(200).json({
        message: "Notifications retrieved successfully",
        notifications,
      });
    } catch (error) {
      console.error("Error fetching notifications:", error.message);
      res.status(500).json({
        message: "Server Error",
        error: error.message,
      });
    }
  };
  
  module.exports = {
    getAllNotifications,
  };