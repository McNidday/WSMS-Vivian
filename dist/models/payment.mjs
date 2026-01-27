import mongoose from "mongoose";
const paymentSchema = new mongoose.Schema({
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    amount: { type: Number, required: true },
    paymentDate: { type: Date, default: Date.now },
    method: {
        type: String,
        enum: ["cash", "mpesa", "paypal", "bank", "card"],
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "completed", "failed", "refunded"],
        default: "pending"
    },
    // PayPal specific fields
    paypalTransactionId: { type: String },
    payerEmail: { type: String },
    payerName: { type: String },
    // Additional payment details
    description: { type: String },
    currency: { type: String, default: "USD" }
});
export default mongoose.model("Payment", paymentSchema);
