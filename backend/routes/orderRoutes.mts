import { Router } from "express";
import orderController from "../controllers/orderController.mjs";
const router = Router();

router.get("/", orderController.getAllOrders);
router.post("/", orderController.createOrder);
router.get("/:id", orderController.getOrder);
router.put("/:id", orderController.updateOrder);
router.delete("/:id", orderController.deleteOrder);

export default router;
