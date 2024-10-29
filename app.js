const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const connectDB = require("./libs/db");

// Customer routes
const authRoutes = require("./routes/auth.route");
const productRoutes = require("./routes/product.route");
const ordersRoutes = require("./routes/order.route");
const promotionRoutes = require("./routes/promotion.route");
const reviewRoutes = require("./routes/review.route");

// Admin routes
const productRoutesAdmin = require("./routes/admin/product.route");
const userRoutesAdmin = require("./routes/admin/user.route");
const orderRouteAdmin = require("./routes/admin/order.route");
const promotionRoutesAdmin = require("./routes/admin/promotion.route");
const reviewRoutesAdmin = require("./routes/admin/review.route");
const revenueRoutesAdmin = require("./routes/admin/revenue.route");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

const corsOptions = {
  origin: [
    "http://localhost:3000",
    "https://i-tribe.vercel.app",
    "http://localhost:5173",
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

// Admin routes
app.use("/api/admin/products", productRoutesAdmin);
app.use("/api/admin/users", userRoutesAdmin);
app.use("/api/admin/orders", orderRouteAdmin);
app.use("/api/admin/reviews", reviewRoutesAdmin);
app.use("/api/admin/promotions", promotionRoutesAdmin);
app.use("/api/admin/revenue", revenueRoutesAdmin);

app.get("/", (_, res) => {
  res.send("Hello World!");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  connectDB();
});
