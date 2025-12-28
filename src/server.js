import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";
import pointsRoutes from "./routes/points.routes.js";
import userRoutes from "./routes/user.routes.js";
import messageRoutes from "./routes/messages.routes.js";
import conversationRoutes from "./routes/conversations.routes.js";

// import productRoutes from "./routes/product.routes.js";
import categoryRoutes from "./routes/category.routes.js";
// import chatRoutes from "./routes/chat.routes.js";
import { stripeWebhookController } from "./controllers/points.controller.js";

dotenv.config();

const app = express();
app.use(cors());
// IMPORTANT: register Stripe webhook routes that require the raw body
// before the JSON body parser middleware so signature verification works.
// app.post("/api/v1/webhook", express.raw({ type: "application/json" }), stripeWebhookController);
app.post(
        "/api/v1/points/stripe-webhook",
        express.raw({ type: "application/json" }),
        stripeWebhookController,
);

app.use(express.json());

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/points", pointsRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/messages", messageRoutes);
app.use("/api/v1/conversations", conversationRoutes);

// app.use("/api/products", productRoutes);
// app.use("/api/chats", chatRoutes);

app.get("/", (req, res) => res.send("NVOE Backend API Running"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () =>
        console.log(`Server running on port ${PORT}`),
);
