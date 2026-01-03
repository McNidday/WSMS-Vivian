import Product from "../models/Product.mjs";
export default {
    getAllProducts: async (req, res) => {
        const products = await Product.find();
        res.json(products);
    },
    createProduct: async (req, res) => {
        const product = new Product(req.body);
        await product.save();
        res.status(201).json(product);
    },
    getProduct: async (req, res) => {
        const product = await Product.findById(req.params.id);
        res.json(product);
    },
    updateProduct: async (req, res) => {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        });
        res.json(product);
    },
    deleteProduct: async (req, res) => {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: "Product deleted" });
    },
};
