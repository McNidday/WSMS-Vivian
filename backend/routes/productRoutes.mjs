import { Router } from "express";
import productController from "../controllers/productController.mjs";

const router = Router();

// Specific routes MUST come before parameterized routes
router.get("/low-stock", productController.getLowStockProducts);
router.get("/inventory-report", productController.getInventoryReport);
router.get("/", productController.getAllProducts);
router.post("/", productController.createProduct);
router.get("/:id", productController.getProduct);
router.put("/:id", productController.updateProduct);
router.delete("/:id", productController.deleteProduct);

export default router;
