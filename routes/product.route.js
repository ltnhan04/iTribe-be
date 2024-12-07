const express = require("express");
const router = express.Router();
const {
  getAllProductsUser,
  getProductById,
  getProductByName,
  getPaginatedProducts,
  searchProducts,
  getProductByPriceRange,
} = require("../controllers/product.controller");

router.get("/", getAllProductsUser);

router.get("/search", searchProducts);
router.get("/range", getProductByPriceRange);
router.get("/paginate", getPaginatedProducts);

router.get("/:id", getProductById);
router.get("/product/:id", getProductById);
router.get("/name/:name", getProductByName);

module.exports = router;
