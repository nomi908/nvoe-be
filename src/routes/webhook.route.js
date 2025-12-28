// import express from "express";
// import { supabase } from "../config/supabase.js";
// import Stripe from "stripe";

// const router = express.Router();
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// // Stripe webhook endpoint
// router.post("/stripe", express.raw({ type: "application/json" }), async (req, res) => {
//   const sig = req.headers["stripe-signature"];
//   const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

//   let event;

//   try {
//     event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
//   } catch (err) {
//     console.error("Webhook signature verification failed.", err.message);
//     return res.status(400).send(`Webhook Error: ${err.message}`);
//   }

//   // Handle the event
//   if (event.type === "payment_intent.succeeded") {
//     const paymentIntent = event.data.object;
//     const transaction_id = paymentIntent.id;

//     try {
//       // Find the product associated with this transaction
//       const { data: product } = await supabase
//         .from("products")
//         .select("*")
//         .eq("transaction_id", transaction_id)
//         .single();

//       if (product && product.status !== "approved") {
//         // Approve product
//         await supabase
//           .from("products")
//           .update({ status: "approved", points_awarded: true })
//           .eq("id", product.id);

//         // Award points to user
//         await supabase
//           .from("users")
//           .update({ points: supabase.raw("points + 100") })
//           .eq("id", product.user_id);

//         console.log(`Product ${product.id} approved and points awarded.`);
//       }
//     } catch (err) {
//       console.error("Failed to auto-approve product on webhook:", err);
//     }
//   }

//   res.json({ received: true });
// });

// export default router;

import express from "express";
import { stripeWebhookController } from "../controllers/webhook.controller.js";

const router = express.Router();

router.post(
  "/stripe",
  express.raw({ type: "application/json" }),
  stripeWebhookController,
);

export default router;
