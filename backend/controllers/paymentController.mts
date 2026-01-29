import Payment from "../models/payment.mjs";
import Order from "../models/Order.mjs";
import { Request, Response } from "express";
import https from "https";
import { DateTime } from "luxon";
import axios from "axios";

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
      const {
        customerId,
        orderId,
        amount,
        method,
        payerName,
        payerEmail,
        description,
      } = req.body;
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

      // For demo purposes, we'll mark as completed after a short delay
      setTimeout(async () => {
        await Payment.findByIdAndUpdate(payment._id, {
          status: "completed",
        });
      }, 1000);

      res.status(201).json(payment);
    } catch (error) {
      console.error("Error creating payment:", error?.response?.data || error);
      res.status(500).json({ message: "Failed to create payment" });
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
      const payment = await Payment.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      })
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
          { status: "completed" },
        );
      }

      res.status(200).json({ message: "Webhook processed" });
    } catch (error) {
      console.error("Error processing PayPal webhook:", error);
      res.status(500).json({ message: "Failed to process webhook", error });
    }
  },
};
