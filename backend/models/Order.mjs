import mongoose, { Schema, model } from "mongoose";

const OrderSchema = new Schema({
    customerId: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
    products: [
        {
            productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
            quantity: { type: Number, required: true, min: 1 },
        },
    ],
    totalAmount: { type: Number, required: true, min: 0 },
    status: { 
        type: String, 
        enum: ["pending", "processing", "paid", "shipped", "delivered", "cancelled"], 
        default: "pending" 
    },
    date: { type: Date, default: Date.now },
    shippingAddress: { type: String },
    notes: { type: String }
});

export default mongoose.models.Order || model("Order", OrderSchema);
