import Product from "../models/Product.mjs";
import { Request, Response } from "express";

export default {
  getAllProducts: async (req: Request, res: Response) => {
    const products = await Product.find();
    res.json(products);
  },
  createProduct: async (req: Request, res: Response) => {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  },
  getProduct: async (req: Request, res: Response) => {
    const product = await Product.findById(req.params.id);
    res.json(product);
  },
  updateProduct: async (req: Request, res: Response) => {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(product);
  },
  deleteProduct: async (req: Request, res: Response) => {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });
  },
};
