import express from "express";
import {
  createCategory,
  getCategories,
} from "../controllers/category.controller.js";

import protect from "../middlewares/auth.middleware.js";
import isAdmin from "../middlewares/admin.middleware.js";

const router = express.Router();

// ADMIN
router.post("/", protect, isAdmin, createCategory);

// PUBLIC
router.get("/", getCategories);

export default router;
