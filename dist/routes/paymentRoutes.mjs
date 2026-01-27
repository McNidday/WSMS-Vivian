import { Router } from "express";
import paymentController from "../controllers/paymentController.mts";
const router = Router();
router.get("/", paymentController.getAllPayments);
router.post("/", paymentController.createPayment);
router.get("/:id", paymentController.getPayment);
router.put("/:id", paymentController.updatePayment);
router.delete("/:id", paymentController.deletePayment);
router.post("/webhook/paypal", paymentController.handlePayPalWebhook);
// Get payments for a specific order
router.get("/order/:orderId", async (req, res) => {
    try {
        const Payment = (await import("../models/payment.mjs")).default;
        const payments = await Payment.find({ orderId: req.params.orderId })
            .populate("customerId", "name email");
        res.json(payments);
    }
    catch (error) {
        console.error("Error fetching order payments:", error);
        res.status(500).json({ message: "Failed to fetch payments", error: error.message });
    }
});
export default router;
