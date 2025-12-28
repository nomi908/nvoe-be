import Stripe from "stripe";
import { supabase } from "../../config/supabase.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method === "POST") {
    const sig = req.headers["stripe-signature"];

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

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
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}
