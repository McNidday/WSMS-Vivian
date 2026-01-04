import Shipping from "../models/Shipping.mjs";
import Order from "../models/Order.mjs";

// Generate unique tracking number
function generateTrackingNumber() {
    return `TRK-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
}

export default {
    getAllShippings: async (req, res) => {
        try {
            const shippings = await Shipping.find()
                .populate("orderId")
                .sort({ createdAt: -1 });
            res.json(shippings);
        } catch (error) {
            console.error("Error fetching shippings:", error);
            res.status(500).json({ message: "Failed to fetch shippings", error: error.message });
        }
    },

    createShipping: async (req, res) => {
        try {
            const { orderId, carrier, shippingAddress, estimatedDelivery } = req.body;
            
            if (!orderId || !shippingAddress) {
                return res.status(400).json({ message: "Order ID and shipping address are required" });
            }

            // Check if order exists
            const order = await Order.findById(orderId);
            if (!order) {
                return res.status(404).json({ message: "Order not found" });
            }

            // Check if shipping already exists for this order
            const existingShipping = await Shipping.findOne({ orderId });
            if (existingShipping) {
                return res.status(400).json({ message: "Shipping already exists for this order" });
            }

            const trackingNumber = generateTrackingNumber();
            const shipping = new Shipping({
                orderId,
                trackingNumber,
                carrier: carrier || "Standard Shipping",
                shippingAddress,
                estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : undefined,
                trackingHistory: [{
                    status: "pending",
                    location: "Warehouse",
                    description: "Order received, preparing for shipment"
                }]
            });

            await shipping.save();

            // Update order status to "shipped"
            await Order.findByIdAndUpdate(orderId, { status: "shipped" });

            res.status(201).json(shipping);
        } catch (error) {
            console.error("Error creating shipping:", error);
            res.status(500).json({ message: "Failed to create shipping", error: error.message });
        }
    },

    getShipping: async (req, res) => {
        try {
            const shipping = await Shipping.findById(req.params.id)
                .populate("orderId");
            if (!shipping) {
                return res.status(404).json({ message: "Shipping not found" });
            }
            res.json(shipping);
        } catch (error) {
            console.error("Error fetching shipping:", error);
            res.status(500).json({ message: "Failed to fetch shipping", error: error.message });
        }
    },

    getShippingByTracking: async (req, res) => {
        try {
            const shipping = await Shipping.findOne({ trackingNumber: req.params.trackingNumber })
                .populate("orderId");
            if (!shipping) {
                return res.status(404).json({ message: "Shipping not found" });
            }
            res.json(shipping);
        } catch (error) {
            console.error("Error fetching shipping:", error);
            res.status(500).json({ message: "Failed to fetch shipping", error: error.message });
        }
    },

    updateShippingStatus: async (req, res) => {
        try {
            const { status, location, description } = req.body;
            const shipping = await Shipping.findById(req.params.id);
            
            if (!shipping) {
                return res.status(404).json({ message: "Shipping not found" });
            }

            // Add to tracking history
            shipping.trackingHistory.push({
                status: status || shipping.status,
                location: location || shipping.currentLocation || "Unknown",
                description: description || `Status updated to ${status}`
            });

            shipping.status = status || shipping.status;
            if (location) shipping.currentLocation = location;
            if (status === "delivered") {
                shipping.actualDelivery = new Date();
                // Update order status
                await Order.findByIdAndUpdate(shipping.orderId, { status: "delivered" });
            }

            await shipping.save();
            res.json(shipping);
        } catch (error) {
            console.error("Error updating shipping:", error);
            res.status(500).json({ message: "Failed to update shipping", error: error.message });
        }
    },

    deleteShipping: async (req, res) => {
        try {
            const shipping = await Shipping.findByIdAndDelete(req.params.id);
            if (!shipping) {
                return res.status(404).json({ message: "Shipping not found" });
            }
            res.json({ message: "Shipping deleted successfully" });
        } catch (error) {
            console.error("Error deleting shipping:", error);
            res.status(500).json({ message: "Failed to delete shipping", error: error.message });
        }
    }
};

