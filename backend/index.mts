import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const { MONGO_URI, PORT } = process.env;

const app = express();
const port = PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static("frontend"));
import productRoutes from "./routes/productRoutes.mjs";
import customerRoutes from "./routes/customerRoutes.mjs";
import orderRoutes from "./routes/orderRoutes.mjs";
import { fileURLToPath } from "url";

app.use("/api/products", productRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/orders", orderRoutes);

import path from "path";
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname , "../frontend/index.html"));
});

if (!MONGO_URI) throw new Error("MONGO_URI environment variable is required!");

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

app.listen(port, () =>
  console.log(`Backend ya vivian iko up and running on port ${PORT}: GOOD!`)
);
