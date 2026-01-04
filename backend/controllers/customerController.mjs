import Customer from "../models/Customer.mjs";
import Order from "../models/Order.mjs";
import Payment from "../models/payment.mjs";

export default {
    getAllCustomers: async (req, res) => {
        try {
            const customers = await Customer.find().sort({ name: 1 });
            res.json(customers);
        } catch (error) {
            console.error("Error fetching customers:", error);
            res.status(500).json({ message: "Failed to fetch customers", error: error.message });
        }
    },
    
    createCustomer: async (req, res) => {
        try {
            const { name, email, phone, address } = req.body;
            if (!name || !email) {
                return res.status(400).json({ message: "Name and email are required" });
            }
            const customer = new Customer({ name, email, phone, address });
            await customer.save();
            res.status(201).json(customer);
        } catch (error) {
            console.error("Error creating customer:", error);
            res.status(500).json({ message: "Failed to create customer", error: error.message });
        }
    },
    
    getCustomer: async (req, res) => {
        try {
            const customer = await Customer.findById(req.params.id);
            if (!customer) {
                return res.status(404).json({ message: "Customer not found" });
            }
            res.json(customer);
        } catch (error) {
            console.error("Error fetching customer:", error);
            res.status(500).json({ message: "Failed to fetch customer", error: error.message });
        }
    },
    
    getCustomerHistory: async (req, res) => {
        try {
            const customerId = req.params.id;
            const customer = await Customer.findById(customerId);
            if (!customer) {
                return res.status(404).json({ message: "Customer not found" });
            }

            // Get all orders for this customer
            const orders = await Order.find({ customerId })
                .populate("products.productId", "name price")
                .sort({ date: -1 });

            // Get all payments for this customer
            const payments = await Payment.find({ customerId })
                .populate("orderId", "totalAmount status")
                .sort({ paymentDate: -1 });

            // Calculate statistics
            const totalOrders = orders.length;
            const totalSpent = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
            const totalPayments = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
            const pendingOrders = orders.filter(o => o.status === "pending" || o.status === "processing").length;

            res.json({
                customer,
                orders,
                payments,
                statistics: {
                    totalOrders,
                    totalSpent,
                    totalPayments,
                    pendingOrders,
                    averageOrderValue: totalOrders > 0 ? totalSpent / totalOrders : 0
                }
            });
        } catch (error) {
            console.error("Error fetching customer history:", error);
            res.status(500).json({ message: "Failed to fetch customer history", error: error.message });
        }
    },
    
    updateCustomer: async (req, res) => {
        try {
            const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
                new: true,
            });
            if (!customer) {
                return res.status(404).json({ message: "Customer not found" });
            }
            res.json(customer);
        } catch (error) {
            console.error("Error updating customer:", error);
            res.status(500).json({ message: "Failed to update customer", error: error.message });
        }
    },
    
    deleteCustomer: async (req, res) => {
        try {
            const customer = await Customer.findByIdAndDelete(req.params.id);
            if (!customer) {
                return res.status(404).json({ message: "Customer not found" });
            }
            res.json({ message: "Customer deleted successfully" });
        } catch (error) {
            console.error("Error deleting customer:", error);
            res.status(500).json({ message: "Failed to delete customer", error: error.message });
        }
    },
};
