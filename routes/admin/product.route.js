const router = require("express").Router();
const { verifyAdmin } = require("../../middleware/auth.middleware");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });

const {
  getAllProductsAdmin,
  getProductDetailsAdmin,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../../controllers/admin/product.controller");

const {
  createProductVariant,
  updateProductVariant,
  deleteProductVariant,
  getAllProductVariants,
} = require("../../controllers/admin/productVariant.controller");

router.get("/", verifyAdmin, getAllProductsAdmin);
router.get("/:id", verifyAdmin, getProductDetailsAdmin);

router.post("/", verifyAdmin, createProduct);
router.put("/:id", verifyAdmin, upload.single("image"), updateProduct);
router.delete("/:id", verifyAdmin, deleteProduct);

router.get("/variant/:productId", getAllProductVariants);

router.post(
  "/variant",
  verifyAdmin,
  upload.array("images", 5),
  createProductVariant
);

router.put(
  "/variant/:variantId",
  verifyAdmin,
  upload.array("images", 5),
  updateProductVariant
);

router.delete("/variant/:variantId", verifyAdmin, deleteProductVariant);

module.exports = router;
