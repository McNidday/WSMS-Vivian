import Customer from "../models/Customer.mjs";
export default {
    getAllCustomers: async (req, res) => {
        const customers = await Customer.find();
        res.json(customers);
    },
    createCustomer: async (req, res) => {
        const customer = new Customer(req.body);
        await customer.save();
        res.status(201).json(customer);
    },
    getCustomer: async (req, res) => {
        const customer = await Customer.findById(req.params.id);
        res.json(customer);
    },
    updateCustomer: async (req, res) => {
        const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        });
        res.json(customer);
    },
    deleteCustomer: async (req, res) => {
        await Customer.findByIdAndDelete(req.params.id);
        res.json({ message: "Customer deleted" });
    },
};
