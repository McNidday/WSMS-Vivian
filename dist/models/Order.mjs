import { Schema, model } from "mongoose";
const OrderSchema = new Schema({
    customerId: { type: Schema.Types.ObjectId, ref: "Customer" },
    products: [
        {
            productId: { type: Schema.Types.ObjectId, ref: "Product" },
            quantity: Number,
        },
    ],
    totalAmount: Number,
    status: String,
    date: { type: Date, default: Date.now },
});
export default model("Order", OrderSchema);
