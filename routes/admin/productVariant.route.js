const router = require("express").Router();
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });
const { verifyAdmin } = require("../../middleware/auth.middleware");
const uploadFile = require("../../helpers/multer.helper");

const {
  createProductVariant,
  updateProductVariant,
  getProductVariant,
  deleteProductVariant,
  getAllProductVariants,
  importVariantFromExcel,
} = require("../../controllers/admin/productVariant.controller");

router.get("/:productId", getAllProductVariants);
router.get("/:id", verifyAdmin, getProductVariant);

router.post("", verifyAdmin, upload.array("images", 5), createProductVariant);

router.put(
  "/:variantId",
  verifyAdmin,
  upload.array("images", 5),
  updateProductVariant
);

router.delete("/:variantId", verifyAdmin, deleteProductVariant);

router.post(
  "/import",
  uploadFile.single("file"),
  verifyAdmin,
  importVariantFromExcel
);

module.exports = router;