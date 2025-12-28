// import Stripe from "stripe";
// import { supabase } from "../../config/supabase.js";

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// export default async function handler(req, res) {
//   if (req.method === "POST") {
//     const sig = req.headers["stripe-signature"];

//     let event;
//     try {
//       event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
//     } catch (err) {
//       console.error("Webhook signature verification failed:", err.message);
//       return res.status(400).send(`Webhook Error: ${err.message}`);
//     }

//     if (event.type === "payment_intent.succeeded") {
//       const paymentIntent = event.data.object;
//       const userId = paymentIntent.metadata?.userId;
//       const pointsPurchased = Number(paymentIntent.metadata?.pointsPurchased);

//       if (userId && pointsPurchased) {
//         const { data: user } = await supabase
//           .from("users")
//           .select("points")
//           .eq("id", userId)
//           .single();

//         const newPoints = (user?.points || 0) + pointsPurchased;

//         await supabase
//           .from("users")
//           .update({ points: newPoints })
//           .eq("id", userId);

//         console.log(`✅ Points added: ${pointsPurchased} to user ${userId}`);
//       }
//     }

//     res.status(200).json({ received: true });
//   } else {
//     res.setHeader("Allow", "POST");
//     res.status(405).end("Method Not Allowed");
//   }
// }

// pages/api/stripe-webhook.js
import Stripe from "stripe";
import { supabase } from "../../config/supabase.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const config = {
  api: {
    bodyParser: false, // disable JSON parsing!
  },
};

// Convert readable stream to raw buffer (Vercel requirement)
const buffer = async (readable) => {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method Not Allowed");
  }

  const buf = await buffer(req);
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
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

  res.status(200).json({ received: true });
}
