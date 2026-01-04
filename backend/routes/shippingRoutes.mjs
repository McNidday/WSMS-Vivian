import { Router } from "express";
import shippingController from "../controllers/shippingController.mjs";

const router = Router();

router.get("/", shippingController.getAllShippings);
router.post("/", shippingController.createShipping);
router.get("/tracking/:trackingNumber", shippingController.getShippingByTracking);
router.get("/:id", shippingController.getShipping);
router.put("/:id/status", shippingController.updateShippingStatus);
router.delete("/:id", shippingController.deleteShipping);

export default router;

