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
//products
router.get("/", verifyAdmin, getAllProductsAdmin);
router.get("/:id", verifyAdmin, getProductDetailsAdmin);
router.post("/", verifyAdmin, upload.array("images", 5), createProduct);
router.put("/:id", verifyAdmin, upload.array("images", 5), updateProduct);
router.delete("/:id", verifyAdmin, deleteProduct);
//variants
router.get("/variant/:productId", getAllProductVariants);
router.post( "/variant",verifyAdmin,upload.single("image"),createProductVariant);
router.put("/variant/:variantId", verifyAdmin,upload.single("image"), updateProductVariant);
router.delete("/variant/:variantId", verifyAdmin, deleteProductVariant);

module.exports = router;
