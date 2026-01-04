import Payment from "../models/payment.mjs";
import Order from "../models/Order.mjs";
import { Request, Response } from "express";

export default {
  getAllPayments: async (req: Request, res: Response) => {
    try {
      const payments = await Payment.find()
        .populate("customerId", "name email")
        .populate("orderId", "totalAmount status")
        .sort({ paymentDate: -1 });
      res.json(payments);
    } catch (error) {
      console.error("Error fetching payments:", error);
      res.status(500).json({ message: "Failed to fetch payments", error });
    }
  },

  createPayment: async (req: Request, res: Response) => {
    try {
      const { customerId, orderId, amount, method, payerName, payerEmail, description } = req.body;
      
      if (!customerId || !amount || !method) {
        return res.status(400).json({ message: "Customer ID, amount, and method are required" });
      }
      
      // If PayPal, handle PayPal payment processing
      if (method.toLowerCase() === "paypal") {
        // For now, we'll simulate PayPal payment
        // In production, integrate with PayPal SDK
        const payment = new Payment({
          customerId,
          orderId,
          amount,
          method: "paypal",
          status: "pending",
          payerName: payerName || req.body.name,
          payerEmail: payerEmail || req.body.email,
          description: description || `Payment for order ${orderId || "N/A"}`,
          currency: req.body.currency || "USD"
        });
        
        await payment.save();
        
        // Simulate PayPal processing (in production, use PayPal SDK)
        // For demo purposes, we'll mark as completed after a short delay
        setTimeout(async () => {
          await Payment.findByIdAndUpdate(payment._id, { 
            status: "completed",
            paypalTransactionId: `PAYPAL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          });
          
          // Update order status if orderId is provided
          if (orderId) {
            await Order.findByIdAndUpdate(orderId, { status: "paid" });
          }
        }, 1000);
        
        return res.status(201).json({
          ...payment.toObject(),
          message: "PayPal payment initiated. Status will be updated shortly."
        });
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
        currency: req.body.currency || "USD"
      });
      
      await payment.save();
      
      // Update order status if orderId is provided
      if (orderId && payment.status === "completed") {
        await Order.findByIdAndUpdate(orderId, { status: "paid" });
      }
      
      res.status(201).json(payment);
    } catch (error) {
      console.error("Error creating payment:", error);
      res.status(500).json({ message: "Failed to create payment", error });
    }
  },

  getPayment: async (req: Request, res: Response) => {
    try {
      const payment = await Payment.findById(req.params.id)
        .populate("customerId", "name email")
        .populate("orderId", "totalAmount status");
      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }
      res.json(payment);
    } catch (error) {
      console.error("Error fetching payment:", error);
      res.status(500).json({ message: "Failed to fetch payment", error });
    }
  },

  updatePayment: async (req: Request, res: Response) => {
    try {
      const payment = await Payment.findByIdAndUpdate(req.params.id, req.body, { new: true })
        .populate("customerId", "name email")
        .populate("orderId", "totalAmount status");
      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }
      res.json(payment);
    } catch (error) {
      console.error("Error updating payment:", error);
      res.status(500).json({ message: "Failed to update payment", error });
    }
  },

  deletePayment: async (req: Request, res: Response) => {
    try {
      const payment = await Payment.findByIdAndDelete(req.params.id);
      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }
      res.json({ message: "Payment deleted successfully" });
    } catch (error) {
      console.error("Error deleting payment:", error);
      res.status(500).json({ message: "Failed to delete payment", error });
    }
  },
  
  // PayPal webhook handler (for production PayPal integration)
  handlePayPalWebhook: async (req: Request, res: Response) => {
    try {
      // In production, verify webhook signature from PayPal
      const { event_type, resource } = req.body;
      
      if (event_type === "PAYMENT.CAPTURE.COMPLETED") {
        const transactionId = resource.id;
        const amount = parseFloat(resource.amount.value);
        
        // Find payment by transaction ID or update based on webhook data
        await Payment.findOneAndUpdate(
          { paypalTransactionId: transactionId },
          { status: "completed" }
        );
      }
      
      res.status(200).json({ message: "Webhook processed" });
    } catch (error) {
      console.error("Error processing PayPal webhook:", error);
      res.status(500).json({ message: "Failed to process webhook", error });
    }
  }
};
