import Order from "../models/Order.mjs";
import Product from "../models/Product.mjs";
import { Request, Response } from "express";

export default {
  getAllOrders: async (req: Request, res: Response) => {
    const orders = await Order.find()
      .populate("customerId")
      .populate("products.productId");
    res.json(orders);
  },
  createOrder: async (req: Request, res: Response) => {
    const product = await Product.findById(req.body.productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    if (req.body.quantity > product.quantity) {
      return res
        .status(400)
        .json({ message: "Insufficient stock for the product" });
    }
    const order = new Order({
      customerId: req.body.customerId,
      products: [
        { productId: req.body.productId, quantity: req.body.quantity },
      ],
      totalAmount: req.body.quantity * product.price,
    });
    await order.save();
    res.status(201).json(order);
  },
  getOrder: async (req: Request, res: Response) => {
    const order = await Order.findById(req.params.id)
      .populate("customerId")
      .populate("products.productId");
    res.json(order);
  },
  updateOrder: async (req: Request, res: Response) => {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(order);
  },
  deleteOrder: async (req: Request, res: Response) => {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: "Order deleted" });
  },
};
