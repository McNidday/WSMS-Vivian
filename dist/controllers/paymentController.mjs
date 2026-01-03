import Payment from "../models/payment.mjs";
export default {
    getAllPayments: async (req, res) => {
        try {
            const payments = await Payment.find().populate("customerId");
            res.json(payments);
        }
        catch (error) {
            console.error("Error fetching payments:", error);
            res.status(500).json({ message: "Failed to fetch payments", error });
        }
    },
    createPayment: async (req, res) => {
        try {
            const payment = new Payment(req.body);
            await payment.save();
            res.status(201).json(payment);
        }
        catch (error) {
            console.error("Error creating payment:", error);
            res.status(500).json({ message: "Failed to create payment", error });
        }
    },
    getPayment: async (req, res) => {
        try {
            const payment = await Payment.findById(req.params.id).populate("customerId");
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
            const payment = await Payment.findByIdAndUpdate(req.params.id, req.body, { new: true });
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
    }
};
