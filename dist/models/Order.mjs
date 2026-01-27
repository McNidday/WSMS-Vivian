import { Schema, model } from "mongoose";
const OrderSchema = new Schema({
    customerId: {
        type: Schema.Types.ObjectId,
        ref: "Customer",
        required: true,
    },
    products: [
        {
            productId: {
                type: Schema.Types.ObjectId,
                ref: "Product",
                required: true,
            },
            quantity: { type: Number, required: true },
        },
    ],
    totalAmount: { type: Number, required: true },
    status: {
        type: String,
        enum: [
            "pending",
            "processing",
            "paid",
            "shipped",
            "delivered",
            "cancelled",
        ],
        default: "pending",
    },
    shippingAddress: { type: String },
    notes: { type: String },
    date: { type: Date, default: Date.now },
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
// `totalPrice`
OrderSchema.virtual("totalPrice").get(function () {
    return this.totalAmount;
});
export default model("Order", OrderSchema);
