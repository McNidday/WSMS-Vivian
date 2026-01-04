import { Router } from "express";
import serviceController from "../controllers/serviceControllers.mts";

const router = Router();

router.get("/", serviceController.getAllServices);
router.post("/", serviceController.createService);
router.get("/:id", serviceController.getService);
router.put("/:id", serviceController.updateService);
router.delete("/:id", serviceController.deleteService);

export default router;
