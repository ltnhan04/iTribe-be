const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const connectDB = require("./libs/db");

const authRoutes = require("./routes/auth.route");
const productRoutes = require("./routes/product.route");
const ordersRoutes = require("./routes/order.route");
const productRoutesAdmin = require("./routes/admin/product.route");
const userRoutesAdmin = require("./routes/admin/user.route");
const orderRouteAdmin = require("./routes/admin/order.route");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
const corsOptions = {
  origin: "http://localhost:3000/",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
};
app.use(cors(corsOptions));
//customer
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", ordersRoutes);
//admin
app.use("/api/admin/products", productRoutesAdmin);
app.use("/api/admin/users", userRoutesAdmin);
app.use("/api/admin/orders", orderRouteAdmin);

app.get("/", (_, res) => {
  res.send("Hello World!");
});
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  connectDB();
});
