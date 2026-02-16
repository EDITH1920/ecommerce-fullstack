import express from "express";
import {
  createProduct,
  getProducts,
  getProductsByCategory,
  getAllProductsAdmin,
  updateProduct,
  deleteProduct,
  getLowStockProducts,
  getProductById,
} from "../controllers/product.controller.js";

import protect from "../middlewares/auth.middleware.js";
import adminMiddleware from "../middlewares/admin.middleware.js";
import upload from "../middlewares/upload.middleware.js";

const router = express.Router();


// =============================
// 🟢 PUBLIC ROUTES
// =============================
router.get("/", getProducts);
router.get("/category/:categoryId", getProductsByCategory);
router.get("/:id", getProductById);


// =============================
// 🔵 ADMIN ROUTES
// =============================

// Create product (with image upload)
router.post(
  "/",
  protect,
  adminMiddleware,
  upload.single("image"),
  createProduct
);

// Get all products (admin)
router.get("/admin", protect, adminMiddleware, getAllProductsAdmin);

// Update product (with optional new image)
router.put(
  "/:id",
  protect,
  adminMiddleware,
  upload.single("image"),
  updateProduct
);

// Delete product
router.delete("/:id", protect, adminMiddleware, deleteProduct);

// Low stock products
router.get(
  "/admin/low-stock",
  protect,
  adminMiddleware,
  getLowStockProducts
);

export default router;
