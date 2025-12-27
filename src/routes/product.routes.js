import express from "express";
import { authenticateJWT } from "../middlewares/auth.middleware.js";
import {
  createProductController,
  getAllProductsController,
  getProductController,
  updateProductController,
  deleteProductController,
  verifyProductController
} from "../controllers/product.controller.js";

import { upload } from "../middlewares/upload.middleware.js";
import { buyPointsController } from "../controllers/points.controller.js";


const router = express.Router();

// CREATE PRODUCT (with images)
router.post("/", authenticateJWT, upload.array("images", 5), createProductController);

// GET ALL PRODUCTS
router.get("/", getAllProductsController);

// GET SINGLE PRODUCT
router.get("/:id", getProductController);

// UPDATE PRODUCT
router.put("/:id", authenticateJWT, upload.array("images", 5), updateProductController);

// DELETE PRODUCT
router.delete("/:id", authenticateJWT, deleteProductController);

// ADMIN VERIFY PRODUCT
router.post("/verify/:id", authenticateJWT, verifyProductController);


router.post("/buy-points", authenticateJWT, buyPointsController);


export default router;
