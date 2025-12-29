// // controllers/points.controller.js
// import Stripe from "stripe";
// import { supabase } from "../config/supabase.js";
// import { ALLOWED_POINT_PACKAGES } from "../config/points.js";

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// // 1️⃣ Create PaymentIntent for Flutter app
// export const buyPointsController = async (req, res) => {
//   try {
//     const { points } = req.body;
//     const userId = req.user?.id;

//     if (!userId) return res.status(401).json({ message: "Unauthorized" });
//     if (!ALLOWED_POINT_PACKAGES.includes(points))
//       return res.status(400).json({ message: "Invalid points package" });

//     const paymentIntent = await stripe.paymentIntents.create({
//       amount: points * 100, // amount in cents
//       currency: "pkr",
//       metadata: { userId, pointsPurchased: points },
//     });

//     res.status(200).json({
//       clientSecret: paymentIntent.client_secret,
//     });
//   } catch (err) {
//     console.error("Error creating Stripe session:", err);
//     res.status(500).json({ message: err.message });
//   }
// };

// // 2️⃣ Webhook to add points
// export const stripeWebhookController = async (req, res) => {
//   const sig = req.headers["stripe-signature"];
//   let event;

//   // Debugging info: log signature presence and raw body details
//   try {
//     console.log("[points.controller] stripe-signature header:", sig ? sig.slice(0, 40) + "..." : sig);
//     console.log(
//       "[points.controller] STRIPE_WEBHOOK_SECRET set:",
//       !!process.env.STRIPE_WEBHOOK_SECRET
//     );
//     console.log(
//       "[points.controller] req.body type:",
//       typeof req.body,
//       "isBuffer:",
//       Buffer.isBuffer(req.body),
//       "length:",
//       req.body ? req.body.length : 0
//     );
//     if (Buffer.isBuffer(req.body)) {
//       console.log(
//         "[points.controller] req.body (start):",
//         req.body.toString("utf8", 0, 200)
//       );
//     }
//   } catch (logErr) {
//     console.error("[points.controller] Error logging request details:", logErr);
//   }

//   try {
//     event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
//   } catch (err) {
//     console.error("Webhook signature verification failed:", err.message);
//     return res.status(400).send(`Webhook Error: ${err.message}`);
//   }

//   if (event.type === "payment_intent.succeeded") {
//     const paymentIntent = event.data.object;
//     const userId = paymentIntent.metadata.userId;
//     const pointsPurchased = parseInt(paymentIntent.metadata.pointsPurchased);

//     if (userId && pointsPurchased) {
//       const { error } = await supabase
//         .from("users")
//         .update({ points: supabase.raw(`points + ${pointsPurchased}`) })
//         .eq("id", userId);

//       if (error) console.error("Failed to add points:", error);
//       else console.log(`✅ User ${userId} awarded ${pointsPurchased} points.`);
//     }
//   }

//   res.json({ received: true });
// };

import Stripe from "stripe";
import { supabase } from "../config/supabase.js";
import { ALLOWED_POINT_PACKAGES, MIN_POINTS } from "../config/points.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// // 1️⃣ Create PaymentIntent for Flutter app
// export const buyPointsController = async (req, res) => {
//   try {
//     const { points } = req.body;
//     const userId = req.user?.id;

//     if (!userId) return res.status(401).json({ message: "Unauthorized" });
//     if (!ALLOWED_POINT_PACKAGES.includes(points))
//       return res.status(400).json({ message: "Invalid points package" });

//     const paymentIntent = await stripe.paymentIntents.create({
//       amount: points * 100, // amount in cents
//       currency: "pkr",
//       metadata: { userId, pointsPurchased: points },
//     });

//     res.status(200).json({
//       clientSecret: paymentIntent.client_secret,
//     });
//   } catch (err) {
//     console.error("Error creating Stripe session:", err);
//     res.status(500).json({ message: err.message });
//   }
// };

// // 2️⃣ Webhook to add points after payment
// export const stripeWebhookController = async (req, res) => {
//   const sig = req.headers["stripe-signature"];
//   let event;

//   try {
//     event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
//   } catch (err) {
//     console.error("Webhook signature verification failed:", err.message);
//     return res.status(400).send(`Webhook Error: ${err.message}`);
//   }

//   if (event.type === "payment_intent.succeeded") {
//     const paymentIntent = event.data.object;
//     const userId = paymentIntent.metadata.userId;
//     const pointsPurchased = parseInt(paymentIntent.metadata.pointsPurchased);

//     if (userId && pointsPurchased) {
//       const { error } = await supabase
//         .from("users")
//         .update({ points: supabase.raw(`points + ${pointsPurchased}`) })
//         .eq("id", userId);

//       if (error) console.error("Failed to add points:", error);
//       else console.log(`✅ User ${userId} awarded ${pointsPurchased} points.`);
//     }
//   }

//   res.json({ received: true });
// };

// Disable bodyParser for Vercel API route
export const config = {
  api: {
    bodyParser: false,
  },
};

// 1️⃣ Create PaymentIntent for Flutter app
export const buyPointsController = async (req, res) => {
  try {
    const { points } = req.body;
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    if (!ALLOWED_POINT_PACKAGES.includes(points))
      return res.status(400).json({ message: "Invalid points package" });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: points * 100, // amount in cents
      currency: "pkr",
      metadata: { userId, pointsPurchased: points },
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err) {
    console.error("Error creating Stripe session:", err);
    res.status(500).json({ message: err.message });
  }
};

// 2️⃣ Webhook to add points
// export const stripeWebhookController = async (req, res) => {
//   console.log("✅ Webhook received");
//   console.log("Headers:", req.headers);
//   console.log("Body length:", req.body?.length);
//   const sig = req.headers["stripe-signature"];
//   let event;

//   // Debugging info: log signature presence and raw body details
//   try {
//     console.log("[points.controller] stripe-signature header:", sig ? sig.slice(0, 40) + "..." : sig);
//     console.log(
//       "[points.controller] STRIPE_WEBHOOK_SECRET set:",
//       !!process.env.STRIPE_WEBHOOK_SECRET
//     );
//     console.log(
//       "[points.controller] req.body type:",
//       typeof req.body,
//       "isBuffer:",
//       Buffer.isBuffer(req.body),
//       "length:",
//       req.body ? req.body.length : 0
//     );
//     if (Buffer.isBuffer(req.body)) {
//       console.log(
//         "[points.controller] req.body (start):",
//         req.body.toString("utf8", 0, 200)
//       );
//     }
//   } catch (logErr) {
//     console.error("[points.controller] Error logging request details:", logErr);
//   }

//   try {
//     event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
//   } catch (err) {
//     console.error("Webhook signature verification failed:", err.message);
//     return res.status(400).send(`Webhook Error: ${err.message}`);
//   }

//   if (event.type === "payment_intent.succeeded") {
//     const paymentIntent = event.data.object;
//     const userId = paymentIntent.metadata.userId;
//     const pointsPurchased = parseInt(paymentIntent.metadata.pointsPurchased);

//     if (userId && pointsPurchased) {
//       const { error } = await supabase
//         .from("users")
//         .update({ points: supabase.raw(`points + ${pointsPurchased}`) })
//         .eq("id", userId);

//       if (error) console.error("Failed to add points:", error);
//       else console.log(`✅ User ${userId} awarded ${pointsPurchased} points.`);
//     }
//   }

//   res.json({ received: true });
// };

// export const stripeWebhookController = async (req, res) => {
//   // 1️⃣ Log raw webhook receipt
//   console.log("✅ Webhook received");
//   const sig = req.headers["stripe-signature"];
//   console.log("stripe-signature header:", sig?.slice(0, 40) + "...");

//   // Ensure req.body is a buffer
//   if (!Buffer.isBuffer(req.body)) {
//     console.error("❌ req.body is not a buffer!");
//     return res.status(400).send("Webhook Error: Request body is not a buffer");
//   }

//   let event;
//   try {
//     // Construct event using Stripe library
//     event = stripe.webhooks.constructEvent(
//       req.body,
//       sig,
//       process.env.STRIPE_WEBHOOK_SECRET
//     );
//   } catch (err) {
//     console.error("❌ Webhook signature verification failed:", err.message);
//     return res.status(400).send(`Webhook Error: ${err.message}`);
//   }

//   console.log("✅ Stripe webhook verified:", event.type);

//   // 2️⃣ Handle successful payments
//   if (event.type === "payment_intent.succeeded") {
//     const paymentIntent = event.data.object;
//     const userId = paymentIntent.metadata.userId;
//     const pointsPurchased = parseInt(paymentIntent.metadata.pointsPurchased);

//     if (userId && pointsPurchased) {
//       try {
//         // Safer approach to increment points
//         const { data: user, error: fetchErr } = await supabase
//           .from("users")
//           .select("points")
//           .eq("id", userId)
//           .single();

//         if (fetchErr || !user) {
//           console.error("❌ User not found:", fetchErr);
//         } else {
//           const newPoints = (user.points || 0) + pointsPurchased;
//           const { error: updateErr } = await supabase
//             .from("users")
//             .update({ points: newPoints })
//             .eq("id", userId);

//           if (updateErr) console.error("❌ Failed to add points:", updateErr);
//           else console.log(`✅ User ${userId} awarded ${pointsPurchased} points.`);
//         }
//       } catch (dbErr) {
//         console.error("❌ Supabase error:", dbErr);
//       }
//     }
//   }

//   // 3️⃣ Respond to Stripe
//   res.json({ received: true });
// };

export const stripeWebhookController = async (req, res) => {
  const body = await req.text(); // ✅ raw text
  const sig = req.headers["stripe-signature"];

  if (!Buffer.isBuffer(req.body)) {
    // console.error("❌ req.body is not raw buffer");
    return res.status(400).send("Invalid body");
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    // console.error("❌ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log("✅ Stripe event:", event.type);

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;
    const userId = paymentIntent.metadata?.userId;
    const pointsPurchased = Number(paymentIntent.metadata?.pointsPurchased);

    if (userId && pointsPurchased) {
      const { data: user } = await supabase
        .from("users")
        .select("points")
        .eq("id", userId)
        .single();

      const newPoints = (user?.points || 0) + pointsPurchased;

      await supabase
        .from("users")
        .update({ points: newPoints })
        .eq("id", userId);

      console.log(`✅ Points added: ${pointsPurchased} to user ${userId}`);
    }
  }

  res.json({ received: true });
};

// 3️⃣ Admin can manually add points to any user
export const adminAddPointsController = async (req, res) => {
  try {
    const { userId, points } = req.body;

    // 1️⃣ Only admin can add points
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can add points" });
    }

    // 2️⃣ Validate input
    if (!userId || !points || points < MIN_POINTS) {
      return res
        .status(400)
        .json({ message: `Points must be at least ${MIN_POINTS}` });
    }

    // Optional: restrict to allowed packages
    if (!ALLOWED_POINT_PACKAGES.includes(points)) {
      return res.status(400).json({ message: "Invalid points package" });
    }

    // 3️⃣ Fetch current points and name
    const { data: user, error: fetchErr } = await supabase
      .from("users")
      .select("points, name")
      .eq("id", userId)
      .single();

    if (fetchErr || !user)
      return res.status(404).json({ message: "User not found" });

    // 4️⃣ Update points manually
    const newPoints = user.points + points;
    const { error: updateErr } = await supabase
      .from("users")
      .update({ points: newPoints })
      .eq("id", userId);

    if (updateErr)
      return res.status(500).json({ message: "Failed to add points" });

    // 5️⃣ Success response
    res.status(200).json({
      message: `Added ${points} points to ${user.name}`,
      user: { name: user.name, points: newPoints },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
