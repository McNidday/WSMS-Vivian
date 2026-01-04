import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: Number,
});

export default mongoose.models.Service || mongoose.model("Service", serviceSchema);
