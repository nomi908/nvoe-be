import express from "express";
import { 
  createCategoryController, 
  getMainCategoriesController, 
  updateCategoryController,
  getSubcategoriesController,
  getMainWithSubcategoriesController
} from "../controllers/category.controller.js";

import { authenticateJWT } from "../middlewares/auth.middleware.js";
import { authorizeRole } from "../middlewares/role.middleware.js";


const router = express.Router();

// Admin can create category
router.post("/", authenticateJWT, authorizeRole(["admin"]), createCategoryController);

// Anyone can fetch categories
router.get("/main", getMainCategoriesController);
router.get("/:parentId/subcategories", getSubcategoriesController);
router.get("/main-with-sub", getMainWithSubcategoriesController);


// Admin-only update category
router.put("/:id", updateCategoryController);

export default router;
