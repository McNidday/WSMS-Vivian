import mongoose, { Schema, model } from "mongoose";

const CustomerSchema = new Schema({
    name: String,
    email: String,
    phone: String,
    address: String,
});

export default mongoose.models.Customer || model("Customer", CustomerSchema);
