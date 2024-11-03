const express = require("express");
const router = express.Router();
const {
  getAllProductsUser,
  getProductById,
  getProductByName,
  getRecommendedProducts,
  getPaginatedProducts,
  searchProducts,
  getProductByPriceRange,
  getProductsByRating,
} = require("../controllers/product.controller");

router.get("/", getAllProductsUser);
router.get("/recommendations", getRecommendedProducts);
router.get("/name/:name", getProductByName);

router.get("/search", searchProducts);
router.get("/range", getProductByPriceRange);
router.get("/rating/:rating", getProductsByRating);
router.get("/paginate", getPaginatedProducts);

router.get("/product/:id", getProductById);

module.exports = router;
