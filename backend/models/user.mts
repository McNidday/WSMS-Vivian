import mongoose, { Document, Schema } from "mongoose";

interface IUser extends Document {
  username: string;
  passwordHash: string;
  role: "admin" | "supplier" | "customer";
}

const userSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "supplier", "customer"],
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model<IUser>("User", userSchema);

