const express = require("express");
const {
  getPaginatedUser,
  getAllUser,
  getUserOrder,
  getUserOrderDetail,
  getUserDetail,
  banUser,
  unBanUser,
} = require("../../controllers/admin/user.controller");
const { verifyAdmin } = require("../../middleware/auth.middleware");

const router = express.Router();

router.get("/", verifyAdmin, getAllUser);
router.get("/paginate", verifyAdmin, getPaginatedUser);

router.get("/:userId", verifyAdmin, getUserDetail);
router.get("/orders/:userId", verifyAdmin, getUserOrder);
router.get(
  "/order/:productVariantId",
  verifyAdmin,
  getUserOrderDetail
);
router.post("/ban/:userId", verifyAdmin, banUser);
router.patch("/unban/:userId", verifyAdmin, unBanUser);
module.exports = router;
