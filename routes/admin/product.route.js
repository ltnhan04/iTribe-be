const router = require("express").Router();
const { verifyAdmin } = require("../../middleware/auth.middleware");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });

const {
  getAllProductsAdmin,
  getProductDetailsAdmin,
  createProduct,
  createProductVariant,
  updateProduct,
  updateProductVariant,
  deleteProduct,
  deleteProductVariant,
} = require("../../controllers/admin/product.controller");

router.get("/", verifyAdmin, getAllProductsAdmin);
router.get("/:id", verifyAdmin, getProductDetailsAdmin);
router.post("/", verifyAdmin, upload.array("images", 5), createProduct);
router.post(
  "/variant",
  verifyAdmin,
  upload.single("image"),
  createProductVariant
);
router.put("/:id", verifyAdmin, updateProduct);
router.delete("/:id", verifyAdmin, deleteProduct);
router.delete("/variant/:variantId", verifyAdmin, deleteProductVariant);

router.put(
  "/variant/:variantId",
  verifyAdmin,
  upload.single("image"),
  updateProductVariant
);

module.exports = router;
