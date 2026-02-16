import express from "express";
import {
  placeOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
  getDashboardStats,
  getMonthlyRevenue,
} from "../controllers/order.controller.js";

import protect from "../middlewares/auth.middleware.js";
import adminMiddleware from "../middlewares/admin.middleware.js";

const router = express.Router();


// =============================
// 👤 USER ROUTES
// =============================
router.post("/", protect, placeOrder);
router.get("/myorders", protect, getMyOrders);


// =============================
// 👑 ADMIN ROUTES
// =============================

// Dashboard stats
router.get(
  "/admin/stats",
  protect,
  adminMiddleware,
  getDashboardStats
);

// Monthly revenue
router.get(
  "/admin/monthly-revenue",
  protect,
  adminMiddleware,
  getMonthlyRevenue
);

// Get all orders
router.get(
  "/admin",
  protect,
  adminMiddleware,
  getAllOrders
);

// Update ONLY order status (Production style)
router.patch(
  "/admin/:id/status",
  protect,
  adminMiddleware,
  updateOrderStatus
);

// Delete order
router.delete(
  "/admin/:id",
  protect,
  adminMiddleware,
  deleteOrder
);

export default router;
