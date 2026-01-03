import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { fileURLToPath } from 'url';
dotenv.config();
const { MONGO_URI, PORT } = process.env;
const app = express();
const port = PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static("frontend"));

import paymentRoutes from './routes/paymentRoutes.mjs';
import aboutRoutes from './routes/aboutRoutes.mjs';
import serviceRoutes from './routes/serviceRoutes.mjs';
import loginRoutes from './routes/loginRoutes.mjs';
import productRoutes from "./routes/productRoutes.mjs";
import customerRoutes from "./routes/customerRoutes.mjs";
import orderRoutes from "./routes/orderRoutes.mjs";

app.use('/api/log in', loginRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/about', aboutRoutes);
app.use('/api/services', serviceRoutes);

app.use("/api/products", productRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/orders", orderRoutes);
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/frontend/index.html");
});
if (!MONGO_URI)
    throw new Error("MONGO_URI environment variable is required!");
mongoose
    .connect(MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.log(err));
app.listen(port, () => console.log(`Backend ya vivian iko up and running on port ${PORT}: GOOD!`));
