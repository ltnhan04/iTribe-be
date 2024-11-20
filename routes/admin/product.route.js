const router = require("express").Router();
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });
const { verifyAdmin } = require("../../middleware/auth.middleware");
const uploadFile = require("../../services/uploadFile.services");

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
  getProductVariant,
  deleteProductVariant,
  getAllProductVariants,
  importVariantFromExcel,
} = require("../../controllers/admin/productVariant.controller");

router.get("/", verifyAdmin, getAllProductsAdmin);
router.get("/:id", verifyAdmin, getProductDetailsAdmin);

router.post("/", verifyAdmin, createProduct);
router.put("/:id", verifyAdmin, upload.single("image"), updateProduct);
router.delete("/:id", verifyAdmin, deleteProduct);
//variant
router.get("/variant/:id", verifyAdmin, getProductVariant);
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

router.post(
  "/variant/import",
  uploadFile.single("file"),
  verifyAdmin,
  importVariantFromExcel
);

module.exports = router;
