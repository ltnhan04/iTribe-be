const router = require("express").Router();
const {
  createReview,
  updateReview,
  deleteReview,
} = require("../controllers/review.controller");
router.post("/", createReview);
router.put("/:id", updateReview);
router.delete("/:id", deleteReview);

module.exports = router;
