import { Schema, model } from "mongoose";

const CustomerSchema = new Schema({
  name: String,
  email: String,
  phone: String,
  address: String,
});

export default model("Customer", CustomerSchema);
