import { Router } from "express";
import { register, login } from "../controllers/userControllers.mjs";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/logout", (req, res) => {
    res.json({ message: "Logged out successfully" });
});

export default router;

