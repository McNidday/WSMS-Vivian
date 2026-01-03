import Order from "../models/Order.mjs";
export default {
    getAllOrders: async (req, res) => {
        const orders = await Order.find()
            .populate("customerId")
            .populate("products.productId");
        res.json(orders);
    },
    createOrder: async (req, res) => {
        const order = new Order(req.body);
        await order.save();
        res.status(201).json(order);
    },
    getOrder: async (req, res) => {
        const order = await Order.findById(req.params.id)
            .populate("customerId")
            .populate("products.productId");
        res.json(order);
    },
    updateOrder: async (req, res) => {
        const order = await Order.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        });
        res.json(order);
    },
    deleteOrder: async (req, res) => {
        await Order.findByIdAndDelete(req.params.id);
        res.json({ message: "Order deleted" });
    },
};
