// import { supabase } from "../config/supabase.js";
// import Stripe from "stripe";

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
// const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

// export const stripeWebhookController = async (req, res) => {
//   const sig = req.headers["stripe-signature"];
//   let event;

//   try {
//     event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
//   } catch (err) {
//     console.error("⚠️ Webhook signature verification failed.", err.message);
//     return res.status(400).send(`Webhook Error: ${err.message}`);
//   }

//   if (event.type === "payment_intent.succeeded") {
//     const paymentIntent = event.data.object;

//     const userId = paymentIntent.metadata?.userId;
//     const pointsPurchased = parseInt(paymentIntent.metadata?.pointsPurchased);

//     if (userId && pointsPurchased) {
//       try {
//         const { data, error } = await supabase
//           .from("users")
//           .update({ points: `points + ${pointsPurchased}` })
//           .eq("id", userId);

//         if (error) {
//           console.error("Failed to add points:", error);
//         } else {
//           console.log(`✅ User ${userId} awarded ${pointsPurchased} points.`);
//         }
//       } catch (err) {
//         console.error("Error updating user points:", err);
//       }
//     }
//   }

//   res.json({ received: true });
// };

// controllers/webhook.controller.js
// import { supabase } from "../config/supabase.js";
// import Stripe from "stripe";
// import { ALLOWED_POINT_PACKAGES } from "../config/points.js";

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
// const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

// export const stripeWebhookController = async (req, res) => {
//   const sig = req.headers["stripe-signature"];
//   let event;

//   try {
//     event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
//   } catch (err) {
//     console.error("⚠️ Webhook verification failed:", err.message);
//     return res.status(400).send(`Webhook Error: ${err.message}`);
//   }

//   if (event.type === "checkout.session.completed") {
//     const session = event.data.object;

//     const userId = session.metadata?.userId;
//     const pointsPurchased = parseInt(session.metadata?.pointsPurchased);

//     console.log("Stripe webhook received →", userId, pointsPurchased);

//     // Validate
//     if (!userId || !pointsPurchased) {
//       console.error("Missing metadata");
//       return res.json({ received: true });
//     }

//     if (!ALLOWED_POINT_PACKAGES.includes(pointsPurchased)) {
//       console.error("Invalid points package in webhook");
//       return res.json({ received: true });
//     }

//     try {
//       // 1) Get current points
//       const { data: user, error: fetchError } = await supabase
//         .from("users")
//         .select("points")
//         .eq("id", userId)
//         .single();

//       if (fetchError) throw fetchError;

//       const newPoints = (user.points || 0) + pointsPurchased;

//       // 2) Update points
//       const { error: updateError } = await supabase
//         .from("users")
//         .update({ points: newPoints })
//         .eq("id", userId);

//       if (updateError) throw updateError;

//       console.log(`✅ User ${userId} +${pointsPurchased} points added`);
//     } catch (err) {
//       console.error("❌ Error updating points:", err.message);
//     }
//   }

//   res.json({ received: true });
// };


import { supabase } from "../config/supabase.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export const stripeWebhookController = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error("⚠️ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case "payment_intent.succeeded":
    case "payment_intent.created": {
      const paymentIntent = event.data.object;
      // If we receive a created event, only proceed when the intent is succeeded.
      if (event.type === "payment_intent.created" && paymentIntent.status !== "succeeded") {
        console.log(
          `⚠️ Received payment_intent.created with status ${paymentIntent.status}; waiting for succeeded.`
        );
        break;
      }

      const userId = paymentIntent.metadata?.userId;
      const pointsPurchased = parseInt(paymentIntent.metadata?.pointsPurchased);


      if (userId && pointsPurchased) {
        try {
          // 1) Fetch current points
          const { data: user, error: fetchError } = await supabase
            .from("users")
            .select("points")
            .eq("id", userId)
            .single();

          if (fetchError) {
            console.error("❌ Failed to fetch user points:", fetchError);
            break;
          }

          const currentPoints = (user?.points) || 0;
          const newPoints = Number(currentPoints) + Number(pointsPurchased);

          // 2) Update points
          const { error: updateError } = await supabase
            .from("users")
            .update({ points: newPoints })
            .eq("id", userId);

          if (updateError) {
            console.error("❌ Failed to add points:", updateError);
          } else {
            console.log(`✅ User ${userId} awarded ${pointsPurchased} points. (was ${currentPoints}, now ${newPoints})`);
          }
        } catch (err) {
          console.error("❌ Error updating user points:", err);
        }
      } else {
        console.log("⚠️ User ID or points missing in payment metadata.");
      }
      break;
    }

    default:
      console.log(`⚠️ Event type ${event.type} not handled.`);
  }

  res.json({ received: true });
};
