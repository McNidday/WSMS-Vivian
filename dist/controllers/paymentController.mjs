import Payment from "../models/payment.mjs";
import { DateTime } from "luxon";
import axios from "axios";
export default {
    getAllPayments: async (req, res) => {
        try {
            const payments = await Payment.find()
                .populate("customerId", "name email")
                .populate("orderId", "totalAmount status")
                .sort({ paymentDate: -1 });
            res.json(payments);
        }
        catch (error) {
            console.error("Error fetching payments:", error);
            res.status(500).json({ message: "Failed to fetch payments", error });
        }
    },
    createPayment: async (req, res) => {
        try {
            const { customerId, orderId, amount, method, payerName, payerEmail, description, } = req.body;
            if (!customerId || !amount || !method) {
                return res
                    .status(400)
                    .json({ message: "Customer ID, amount, and method are required" });
            }
            // For other payment methods
            const payment = new Payment({
                customerId,
                orderId,
                amount,
                method,
                status: method.toLowerCase() === "cash" ? "completed" : "pending",
                payerName: payerName || req.body.name,
                payerEmail: payerEmail || req.body.email,
                description: description || `Payment via ${method}`,
                currency: req.body.currency || "KSH",
            });
            await payment.save();
            if (method.toLowerCase() !== "cash") {
                // Simulate PayPal processing (in production, use PayPal SDK)
                const timestamp = DateTime.now().toFormat("yyyyMMddhhmmss");
                // Mpesa payment simulation
                const res = await axios.post("https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest", {
                    Password: "MTc0Mzc5YmZiMjc5ZjlhYTliZGJjZjE1OGU5N2RkNzFhNDY3Y2QyZTBjODkzMDU5YjEwZjc4ZTZiNzJhZGExZWQyYzkxOTIwMjYwMTIzMjM1NzQy",
                    BusinessShortCode: "174379",
                    Timestamp: timestamp,
                    Amount: "1",
                    PartyA: "254748612580",
                    PartyB: "174379",
                    TransactionType: "CustomerPayBillOnline",
                    PhoneNumber: "254748612580",
                    TransactionDesc: "Test",
                    AccountReference: "Test",
                    CallBackURL: "https://mydomain.com/mpesa-express-simulate/",
                }, { headers: { Authorization: `Bearer ACCES` } });
                console.log("Simulated PayPal/Mpesa response:", res.data);
            }
            // For demo purposes, we'll mark as completed after a short delay
            setTimeout(async () => {
                await Payment.findByIdAndUpdate(payment._id, {
                    status: "completed",
                });
            }, 1000);
            res.status(201).json(payment);
        }
        catch (error) {
            console.error("Error creating payment:", error?.response?.data || error);
            res.status(500).json({ message: "Failed to create payment" });
        }
    },
    getPayment: async (req, res) => {
        try {
            const payment = await Payment.findById(req.params.id)
                .populate("customerId", "name email")
                .populate("orderId", "totalAmount status");
            if (!payment) {
                return res.status(404).json({ message: "Payment not found" });
            }
            res.json(payment);
        }
        catch (error) {
            console.error("Error fetching payment:", error);
            res.status(500).json({ message: "Failed to fetch payment", error });
        }
    },
    updatePayment: async (req, res) => {
        try {
            const payment = await Payment.findByIdAndUpdate(req.params.id, req.body, {
                new: true,
            })
                .populate("customerId", "name email")
                .populate("orderId", "totalAmount status");
            if (!payment) {
                return res.status(404).json({ message: "Payment not found" });
            }
            res.json(payment);
        }
        catch (error) {
            console.error("Error updating payment:", error);
            res.status(500).json({ message: "Failed to update payment", error });
        }
    },
    deletePayment: async (req, res) => {
        try {
            const payment = await Payment.findByIdAndDelete(req.params.id);
            if (!payment) {
                return res.status(404).json({ message: "Payment not found" });
            }
            res.json({ message: "Payment deleted successfully" });
        }
        catch (error) {
            console.error("Error deleting payment:", error);
            res.status(500).json({ message: "Failed to delete payment", error });
        }
    },
    // PayPal webhook handler (for production PayPal integration)
    handlePayPalWebhook: async (req, res) => {
        try {
            // In production, verify webhook signature from PayPal
            const { event_type, resource } = req.body;
            if (event_type === "PAYMENT.CAPTURE.COMPLETED") {
                const transactionId = resource.id;
                const amount = parseFloat(resource.amount.value);
                // Find payment by transaction ID or update based on webhook data
                await Payment.findOneAndUpdate({ paypalTransactionId: transactionId }, { status: "completed" });
            }
            res.status(200).json({ message: "Webhook processed" });
        }
        catch (error) {
            console.error("Error processing PayPal webhook:", error);
            res.status(500).json({ message: "Failed to process webhook", error });
        }
    },
};
