import mongoose from "mongoose";
const paymentSchema = new mongoose.Schema({
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    amount: { type: Number, required: true },
    paymentDate: { type: Date, default: Date.now },
    method: { type: String, enum: ["cash", "card", "bank"], required: true }
});
export default mongoose.model("Payment", paymentSchema);
