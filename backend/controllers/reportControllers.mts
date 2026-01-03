
import { Request, Response } from "express";
import Order from "../models/Order.mjs";
import Product from "../models/Product.mjs";
import Customer from "../models/Customer.mjs"
import { IOrder } from "../models/Order.mjs";

export const getSalesReport = async (_req: Request, res: Response) => {
  try {
    
    const orders = (await Order.find()
      .populate("customerId", "name")
      .populate("products.productId", "name")
      .exec()) as unknown as IOrder[];

    const totalSales = orders.reduce((sum, o) => sum + (o.totalAmount ?? 0), 0);
    const totalOrders = orders.length;

    const productSales: Record<string, number> = {};
    for (const o of orders) {
      for (const entry of o.products) {
        const pid = (entry.productId as any)?._id?.toString() ?? entry.productId?.toString();
        if (!pid) continue;
        productSales[pid] = (productSales[pid] || 0) + (entry.quantity ?? 0);
      }
    }

    let bestProduct = "N/A";
    if (Object.keys(productSales).length) {
      const bestProductId = Object.entries(productSales).sort((a, b) => b[1] - a[1])[0][0];
      const prod = await Product.findById(bestProductId).exec();
      bestProduct = prod?.name ?? "N/A";
    }

    const customerTotals: Record<string, number> = {};
    for (const o of orders) {
      const cid = (o.customerId as any)?._id?.toString() ?? (o.customerId as any)?.toString();
      if (!cid) continue;
      customerTotals[cid] = (customerTotals[cid] || 0) + (o.totalAmount ?? 0);
    }

    let topCustomer = "N/A";
    if (Object.keys(customerTotals).length) {
      const topCustomerId = Object.entries(customerTotals).sort((a, b) => b[1] - a[1])[0][0];
      const cust = await Customer.findById(topCustomerId).exec();
      topCustomer = cust?.name ?? "N/A";
    }

    res.json({ totalSales, totalOrders, bestProduct, topCustomer });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

