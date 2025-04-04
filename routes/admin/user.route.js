const express = require("express");
const {
  getPaginatedUser,
  getAllUser,
  getUserOrder,
  getUserOrderDetail,
  getUserDetail,
} = require("../../controllers/admin/user.controller");
const { verifyAdmin } = require("../../middleware/auth.middleware");

const router = express.Router();

router.get("/paginate", verifyAdmin, getPaginatedUser);
router.get("/", verifyAdmin, getAllUser);
router.get("/:userId", verifyAdmin, getUserDetail);
module.exports = router;
