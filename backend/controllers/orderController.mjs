import mongoose from "mongoose";
import Order from "../models/Order.mjs";
import Product from "../models/Product.mjs";
import Customer from "../models/Customer.mjs";

export default {
    getAllOrders: async (req, res) => {
        try {
            const orders = await Order.find()
                .populate("customerId", "name email phone address")
                .populate("products.productId", "name price")
                .sort({ date: -1 });
            
            // Format orders for frontend
            const formattedOrders = orders.map(order => {
                const customer = order.customerId;
                const products = order.products.map(p => {
                    const product = p.productId;
                    return {
                        name: product?.name || "Unknown",
                        quantity: p.quantity,
                        price: product?.price || 0
                    };
                });
                
                return {
                    _id: order._id,
                    customerName: customer?.name || "Unknown",
                    customerId: customer?._id,
                    products: products,
                    productName: products.map(p => `${p.name} (${p.quantity})`).join(", "),
                    quantity: order.products.reduce((sum, p) => sum + p.quantity, 0),
                    totalPrice: order.totalAmount,
                    totalAmount: order.totalAmount,
                    status: order.status,
                    date: order.date
                };
            });
            
            res.json(formattedOrders);
        } catch (error) {
            console.error("Error fetching orders:", error);
            res.status(500).json({ message: "Failed to fetch orders", error: error.message });
        }
    },
    
    createOrder: async (req, res) => {
        try {
            const { customerId, productId, quantity, products } = req.body;
            
            console.log("Order creation request:", { customerId, productId, quantity, products });
            
            // Support both single product and multiple products
            let orderProducts = [];
            if (products && Array.isArray(products)) {
                // Multiple products format
                orderProducts = products;
            } else if (productId && quantity) {
                // Single product format (for backward compatibility)
                orderProducts = [{ productId, quantity: Number(quantity) }];
            } else {
                return res.status(400).json({ message: "Invalid order data. Provide either products array or productId with quantity." });
            }
            
            if (!customerId) {
                return res.status(400).json({ message: "Customer ID is required" });
            }
            
            // Validate customer exists
            const customer = await Customer.findById(customerId);
            if (!customer) {
                return res.status(404).json({ message: "Customer not found" });
            }
            
            // Validate products and calculate total, check inventory
            let totalAmount = 0;
            const productUpdates = [];
            
            for (const item of orderProducts) {
                if (!item.productId || item.quantity === undefined || item.quantity === null) {
                    return res.status(400).json({ message: "Each product must have productId and quantity" });
                }
                
                const product = await Product.findById(item.productId);
                if (!product) {
                    return res.status(404).json({ message: `Product with ID ${item.productId} not found` });
                }
                
                if (product.quantity < item.quantity) {
                    return res.status(400).json({ 
                        message: `Insufficient inventory for ${product.name}. Available: ${product.quantity}, Requested: ${item.quantity}` 
                    });
                }
                
                const itemQuantity = Number(item.quantity) || 0;
                const itemPrice = Number(product.price) || 0;
                const itemTotal = itemPrice * itemQuantity;
                
                console.log(`Product ${product.name}: price=${itemPrice}, quantity=${itemQuantity}, total=${itemTotal}`);
                
                totalAmount += itemTotal;
                productUpdates.push({
                    productId: product._id,
                    product,
                    quantity: itemQuantity
                });
            }
            
            // Ensure totalAmount is valid
            totalAmount = Number(totalAmount.toFixed(2));
            console.log("Calculated totalAmount:", totalAmount);
            
            if (isNaN(totalAmount) || totalAmount <= 0) {
                return res.status(400).json({ 
                    message: `Invalid total amount calculated: ${totalAmount}. Please check product prices.`,
                    debug: {
                        orderProducts,
                        productUpdates: productUpdates.map(u => ({
                            productId: u.productId,
                            productName: u.product?.name,
                            price: u.product?.price,
                            quantity: u.quantity
                        }))
                    }
                });
            }
            
            // Ensure totalAmount is definitely a number
            const finalTotalAmount = Number(totalAmount);
            if (isNaN(finalTotalAmount) || finalTotalAmount <= 0) {
                return res.status(400).json({ message: "Failed to calculate valid total amount" });
            }
            
            // Create order with all required fields
            const orderData = {
                customerId: customerId,
                products: orderProducts.map(p => ({
                    productId: p.productId,
                    quantity: Number(p.quantity) || 0
                })),
                totalAmount: finalTotalAmount,
                status: "pending"
            };
            
            console.log("=== ORDER CREATION DEBUG ===");
            console.log("Calculated totalAmount:", finalTotalAmount);
            console.log("finalTotalAmount type:", typeof finalTotalAmount);
            console.log("finalTotalAmount is NaN:", isNaN(finalTotalAmount));
            console.log("Order data before creation:", {
                customerId: orderData.customerId,
                productsCount: orderData.products.length,
                totalAmount: orderData.totalAmount,
                totalAmountType: typeof orderData.totalAmount
            });
            
            // Create order instance
            const order = new Order();
            order.customerId = orderData.customerId;
            order.products = orderData.products;
            order.totalAmount = orderData.totalAmount; // Explicitly set
            order.status = orderData.status;
            
            console.log("Order instance after setting fields:");
            console.log("- customerId:", order.customerId);
            console.log("- products:", order.products.length);
            console.log("- totalAmount:", order.totalAmount);
            console.log("- totalAmount type:", typeof order.totalAmount);
            console.log("- totalAmount exists:", order.totalAmount !== undefined);
            
            // Validate before saving
            const validationError = order.validateSync();
            if (validationError) {
                console.error("Order validation error:", validationError);
                console.error("Validation errors:", Object.keys(validationError.errors || {}));
                return res.status(400).json({ 
                    message: "Order validation failed", 
                    errors: Object.keys(validationError.errors || {}).map(key => ({
                        field: key,
                        message: validationError.errors[key].message,
                        value: order[key]
                    }))
                });
            }
            
            await order.save();
            console.log("✅ Order saved successfully with ID:", order._id);
            console.log("✅ Confirmed totalAmount:", order.totalAmount);
            
            // Reduce inventory
            for (const update of productUpdates) {
                await Product.findByIdAndUpdate(update.productId, {
                    $inc: { quantity: -update.quantity }
                });
            }
            
            // Populate and return formatted order
            const populatedOrder = await Order.findById(order._id)
                .populate("customerId", "name email phone address")
                .populate("products.productId", "name price");
            
            const customer = populatedOrder.customerId;
            const products = populatedOrder.products.map(p => {
                const product = p.productId;
                return {
                    name: product?.name || "Unknown",
                    quantity: p.quantity,
                    price: product?.price || 0
                };
            });
            
            res.status(201).json({
                _id: populatedOrder._id,
                customerName: customer?.name || "Unknown",
                customerId: customer?._id,
                products: products,
                productName: products.map(p => `${p.name} (${p.quantity})`).join(", "),
                quantity: populatedOrder.products.reduce((sum, p) => sum + p.quantity, 0),
                totalPrice: populatedOrder.totalAmount,
                totalAmount: populatedOrder.totalAmount,
                status: populatedOrder.status,
                date: populatedOrder.date
            });
        } catch (error) {
            console.error("Error creating order:", error);
            res.status(500).json({ message: "Failed to create order", error: error.message });
        }
    },
    
    getOrder: async (req, res) => {
        try {
            const order = await Order.findById(req.params.id)
                .populate("customerId", "name email phone address")
                .populate("products.productId", "name price");
            
            if (!order) {
                return res.status(404).json({ message: "Order not found" });
            }
            
            res.json(order);
        } catch (error) {
            console.error("Error fetching order:", error);
            res.status(500).json({ message: "Failed to fetch order", error: error.message });
        }
    },
    
    updateOrder: async (req, res) => {
        try {
            const { status } = req.body;
            const order = await Order.findByIdAndUpdate(
                req.params.id, 
                { ...req.body },
                { new: true }
            )
                .populate("customerId", "name email phone address")
                .populate("products.productId", "name price");
            
            if (!order) {
                return res.status(404).json({ message: "Order not found" });
            }
            
            res.json(order);
        } catch (error) {
            console.error("Error updating order:", error);
            res.status(500).json({ message: "Failed to update order", error: error.message });
        }
    },
    
    deleteOrder: async (req, res) => {
        try {
            const order = await Order.findById(req.params.id);
            if (!order) {
                return res.status(404).json({ message: "Order not found" });
            }
            
            // Restore inventory if order is deleted
            if (order.status !== "cancelled") {
                for (const item of order.products) {
                    await Product.findByIdAndUpdate(item.productId, {
                        $inc: { quantity: item.quantity }
                    });
                }
            }
            
            await Order.findByIdAndDelete(req.params.id);
            res.json({ message: "Order deleted successfully" });
        } catch (error) {
            console.error("Error deleting order:", error);
            res.status(500).json({ message: "Failed to delete order", error: error.message });
        }
    },
};
