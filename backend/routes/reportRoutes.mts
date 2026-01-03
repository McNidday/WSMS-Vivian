import express, { Request, Response } from "express";
import Order, { IOrder } from "../models/Order.mjs";
import Product from "../models/Product.mjs";
import Customer from "../models/Customer.mjs";

const router = express.Router();

// GET /api/reports/sales
router.get("/sales", async (req: Request, res: Response) => {
  try {
    const orders = (await Order.find()
      .populate("products.productId", "name")
      .populate("customerId", "name")
      .exec()) as unknown as IOrder[];

    const totalSales = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
    const totalOrders = orders.length;

    // best sales product
    const productSales: Record<string, number> = {};
    for (const o of orders) {
      for (const p of o.products) {
        const pid = p.productId?.toString();
        if (pid) {
          productSales[pid] = (productSales[pid] || 0) + p.quantity;
        }
      }
    }

    let bestProduct = "N/A";
    if (Object.keys(productSales).length > 0) {
      const [bestProductId] = Object.entries(productSales).sort((a, b) => b[1] - a[1])[0];
      const product = await Product.findById(bestProductId);
      bestProduct = product?.name || "N/A";
    }

    // Top customer
    const customerTotals: Record<string, number> = {};
    for (const o of orders) {
      const cid = o.customerId?.toString();
      if (cid) {
        customerTotals[cid] = (customerTotals[cid] || 0) + (o.totalPrice || 0);
      }
    }

    let topCustomer = "N/A";
    if (Object.keys(customerTotals).length > 0) {
      const [topCustomerId] = Object.entries(customerTotals).sort((a, b) => b[1] - a[1])[0];
      const customer = await Customer.findById(topCustomerId);
      topCustomer = customer?.name || "N/A";
    }

    res.json({ totalSales, totalOrders, bestProduct, topCustomer });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;

