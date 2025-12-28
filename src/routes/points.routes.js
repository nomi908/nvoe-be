// import express from "express";
// import { stripeWebhookController, buyPointsController } from "../controllers/points.controller.js";
// import { authenticateJWT } from "../middlewares/auth.middleware.js";

// const router = express.Router();

// // Buy points (frontend)
// router.post("/buy", authenticateJWT, buyPointsController);

// // Stripe webhook (raw body, no auth)
// router.post(
//   "/stripe-webhook",
//   express.raw({ type: "application/json" }),
//   stripeWebhookController
// );

// export default router;

import express from "express";
import { stripeWebhookController, buyPointsController, adminAddPointsController } from "../controllers/points.controller.js";
import { authenticateJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Buy points (frontend)
router.post("/buy", authenticateJWT, buyPointsController);

// Admin add points to any user
router.post("/admin/add", authenticateJWT, adminAddPointsController);

// Stripe webhook (raw body, no auth)
// router.post(
//   "/stripe-webhook",
//   express.raw({ type: "application/json" }),
//   stripeWebhookController
// );

export default router;

