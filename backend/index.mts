import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

dotenv.config();

const { MONGO_URI, PORT } = process.env;

const app = express();
const port = PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static("frontend"));

// Routes
import productRoutes from "./routes/productRoutes.mjs";
import customerRoutes from "./routes/customerRoutes.mjs";
import orderRoutes from "./routes/orderRoutes.mjs";
import paymentRoutes from "./routes/paymentRoutes.mjs";
import shippingRoutes from "./routes/shippingRoutes.mjs";
import authRoutes from "./routes/authRoutes.mts";
import reportRoutes from "./routes/reportRoutes.mts";
import aboutRoutes from "./routes/aboutRoutes.mjs";
import serviceRoutes from "./routes/serviceRoutes.mjs";

app.use("/api/products", productRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/shipping", shippingRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/about", aboutRoutes);
app.use("/api/services", serviceRoutes);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

app.get("/dashboard.html", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dashboard.html"));
});

if (!MONGO_URI) throw new Error("MONGO_URI environment variable is required!");

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

app.listen(port, () =>
  console.log(`Backend ya vivian iko up and running on port ${port}: GOOD!`)
);
