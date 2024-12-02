const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");

const connectDB = require("./libs/db");
const socketHandler = require("./libs/socket");
// Customer routes
const authRoutes = require("./routes/auth.route");
const productRoutes = require("./routes/product.route");
const ordersRoutes = require("./routes/order.route");
const promotionRoutes = require("./routes/promotion.route");
const reviewRoutes = require("./routes/review.route");
const paymentRoutes = require("./routes/payment.route");

// Admin routes
const productRoutesAdmin = require("./routes/admin/product.route");
const userRoutesAdmin = require("./routes/admin/user.route");
const orderRouteAdmin = require("./routes/admin/order.route");
const promotionRoutesAdmin = require("./routes/admin/promotion.route");
const reviewRoutesAdmin = require("./routes/admin/review.route");
const revenueRoutesAdmin = require("./routes/admin/revenue.route");
const notificationRouteAdmin = require("./routes/admin/notification.route");

// Chat routes
const chatRoutes = require("./routes/chat.route");

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "https://i-tribe.vercel.app",
      "https://i-tribe-admin.vercel.app",
      "http://localhost:5173",
      "*",
    ],
    credentials: true,
  },
});

const PORT = process.env.PORT || 5000;

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

const corsOptions = {
  origin: [
    "http://localhost:3000",
    "https://i-tribe.vercel.app",
    "https://i-tribe-admin.vercel.app",
    "http://localhost:5173",
    "*",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
};

app.use(cors(corsOptions));

// Customer routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/promotions", promotionRoutes);
app.use("/api/payment", paymentRoutes);

// Admin routes 
app.use("/api/admin/products", productRoutesAdmin);
app.use("/api/admin/users", userRoutesAdmin);
app.use("/api/admin/orders", orderRouteAdmin);
app.use("/api/admin/reviews", reviewRoutesAdmin);
app.use("/api/admin/promotions", promotionRoutesAdmin);
app.use("/api/admin/revenue", revenueRoutesAdmin);
app.use("/api/admin/notifications", notificationRouteAdmin);

// Chat routes
app.use("/api/chat", chatRoutes);

app.get("/", (_, res) => {
  res.send("Hello World!");
});

socketHandler(io);

app.use((error, _req, res, _next) => {
  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal Server Error";
  res.status(statusCode).json({ message });
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  connectDB();
});
