const express = require("express");
const router = express.Router();
const { verifyAdmin } = require("../../middleware/auth.middleware");
const {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} = require("../../controllers/admin/category.controller");

// Category routes
router.get("/", getAllCategories);
router.get("/:id", getCategoryById);

// Admin only routes
router.post("/", verifyAdmin, createCategory);
router.put("/:id", verifyAdmin, updateCategory);
router.delete("/:id", verifyAdmin, deleteCategory);

module.exports = router; 