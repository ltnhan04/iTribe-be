const router = require("express").Router();
const { deleteReview } = require("../../controllers/admin/review.controller");

router.delete("/:id", deleteReview);
module.exports = router;
