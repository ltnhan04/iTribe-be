const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");

dotenv.config();

const app = express();

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(cors());

app.get("/", () => {
  console.log("Hello World");
});
app.listen(8000, () => {
  console.log(`Server is running on http://localhost:8000`);
});
