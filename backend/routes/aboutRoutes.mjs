import { Router } from "express";
import aboutController from "../controllers/aboutControllers.mjs";

const router = Router();

router.get("/", aboutController.getAllAbouts);
router.post("/", aboutController.createAbout);
router.get("/:id", aboutController.getAbout);
router.put("/:id", aboutController.updateAbout);
router.delete("/:id", aboutController.deleteAbout);

export default router;
