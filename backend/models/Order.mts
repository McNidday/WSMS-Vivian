import { Schema, model, Document } from "mongoose";

export interface IOrder extends Document {
  customerId: Schema.Types.ObjectId;
  products: { productId: Schema.Types.ObjectId; quantity: number }[];
  totalAmount: number;
  status: string;
  date: Date;
  totalPrice?: number; // 👈 virtual alias
  shippingAddress?: string;
  notes?: string;
}

const OrderSchema = new Schema<IOrder>(
  {
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
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// `totalPrice`
OrderSchema.virtual("totalPrice").get(function (this: IOrder) {
  return this.totalAmount;
});

export default model<IOrder>("Order", OrderSchema);
