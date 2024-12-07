const router = require("express").Router();
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });
const { verifyAdmin } = require("../../middleware/auth.middleware");

const {
  getAllProductsAdmin,
  getProductDetailsAdmin,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../../controllers/admin/product.controller");

router.get("/", verifyAdmin, getAllProductsAdmin);
router.get("/:id", verifyAdmin, getProductDetailsAdmin);

router.post("/", verifyAdmin, createProduct);
router.put("/:id", verifyAdmin, upload.single("image"), updateProduct);
router.delete("/:id", verifyAdmin, deleteProduct);

module.exports = router;
