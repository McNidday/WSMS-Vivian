import mongoose, { Schema } from "mongoose";
const userSchema = new Schema({
    username: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: {
        type: String,
        enum: ["admin", "supplier", "customer"],
        required: true,
    },
}, { timestamps: true });
export default mongoose.models.User || mongoose.model("User", userSchema);
