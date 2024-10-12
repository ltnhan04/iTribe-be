const router = require("express").Router();
const {
  createReview,
  updateReview,
  deleteReview,
} = require("../controllers/review,controller");
const { verifyToken } = require("../middleware/auth.middleware");

router.post("/", verifyToken, createReview);
router.put("/:id", verifyToken, updateReview);
router.delete("/:id", verifyToken, deleteReview);

module.exports = router;
