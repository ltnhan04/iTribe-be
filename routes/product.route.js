const express = require("express");
const router = express.Router();
const {
  getAllProductsUser,
  getProductById,
  getProductVariantById,
} = require("../controllers/product.controller");

router.get("/", getAllProductsUser);
router.get("/:id", getProductById);
router.get("/variant/:id", getProductVariantById);
module.exports = router;
