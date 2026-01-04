import mongoose, { Schema, model } from "mongoose";

const ShippingSchema = new Schema({
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    trackingNumber: { type: String, unique: true, required: true },
    carrier: { type: String, required: true, default: "Standard Shipping" },
    status: {
        type: String,
        enum: ["pending", "in_transit", "out_for_delivery", "delivered", "exception"],
        default: "pending"
    },
    estimatedDelivery: { type: Date },
    actualDelivery: { type: Date },
    shippingAddress: { type: String, required: true },
    currentLocation: { type: String },
    trackingHistory: [{
        status: String,
        location: String,
        timestamp: { type: Date, default: Date.now },
        description: String
    }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

ShippingSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

export default mongoose.models.Shipping || model("Shipping", ShippingSchema);

