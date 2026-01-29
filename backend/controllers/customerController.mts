import Customer from "../models/Customer.mjs";
import { Request, Response } from "express";

export default {
  getAllCustomers: async (req: Request, res: Response) => {
    const customers = await Customer.find();
    res.json(customers);
  },
  createCustomer: async (req: Request, res: Response) => {
    const customer = new Customer(req.body);
    await customer.save();
    res.status(201).json(customer);
  },
  getCustomer: async (req: Request, res: Response) => {
    const customer = await Customer.findById(req.params.id);
    res.json(customer);
  },
  updateCustomer: async (req: Request, res: Response) => {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(customer);
  },
  deleteCustomer: async (req: Request, res: Response) => {
    await Customer.findByIdAndDelete(req.params.id);
    res.json({ message: "Customer deleted" });
  },
};