const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const connectDB = require("./libs/db");

const authRoutes = require("./routes/auth.route");
const productRoutes = require("./routes/product.route");
const productRoutesAdmin = require("./routes/admin/product.route");
const userRoutesAdmin = require("./routes/admin/user.route");
const orderRouteAdmin = require("./routes/admin/order.route");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

// CORS options
const corsOptions = {
  origin: "http://localhost:3000", // Removed the trailing slash
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true, // Enable sending cookies
};

app.use(cors(corsOptions));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);

// Admin routes
app.use("/api/admin/products", productRoutesAdmin);
app.use("/api/admin/users", userRoutesAdmin);
app.use("/api/admin/orders", orderRouteAdmin);

// Basic route
app.get("/", (_, res) => {
  res.send("Hello World!");
});

// Start the server and connect to the database
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  connectDB();
});
