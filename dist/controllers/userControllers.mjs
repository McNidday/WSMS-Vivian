import User from "../models/User.mjs";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
export async function register(req, res) {
    try {
        const { username, password, role } = req.body;
        if (!username || !password || !role) {
            return res.status(400).json({ message: "⚠️ Username, password, and role are required" });
        }
        const exists = await User.findOne({ username });
        if (exists) {
            return res.status(409).json({ message: "❌ Username already taken" });
        }
        const passwordHash = await bcrypt.hash(password, 10);
        const user = await User.create({ username, passwordHash, role });
        return res.status(201).json({
            id: user._id,
            username: user.username,
            role: user.role,
        });
    }
    catch (err) {
        console.error("Register error:", err);
        return res.status(500).json({ message: "❌ Register failed", error: err.message });
    }
}
export async function login(req, res) {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: "❌ Invalid username or password" });
        }
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) {
            return res.status(401).json({ message: "❌ Invalid username or password" });
        }
        const token = jwt.sign({ sub: user._id, username: user.username, role: user.role }, process.env.JWT_SECRET ?? "vivian", { expiresIn: "2d" });
        return res.json({ token, role: user.role });
    }
    catch (err) {
        console.error("Login error:", err);
        return res.status(500).json({ message: "❌ Login failed", error: err.message });
    }
}
export function authMiddleware(req, res, next) {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) {
        return res.status(401).json({ message: "❌ No token provided" });
    }
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET ?? "vivian");
        req.user = payload;
        next();
    }
    catch (err) {
        return res.status(401).json({ message: "❌ Invalid or expired token" });
    }
}
