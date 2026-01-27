import Product from "../models/Product.mjs";
export default {
    getAllProducts: async (req, res) => {
        try {
            const { low, inventory } = req.query;
            const filter = {};
            // Apply low-stock filter ONLY if provided
            if (low !== undefined) {
                const lowValue = Number(low);
                if (isNaN(lowValue)) {
                    return res.status(400).json({ message: "low must be a number" });
                }
                filter.quantity = { $lt: lowValue };
            }
            const products = await Product.find(filter);
            // If inventory summary is NOT requested → return products only
            if (!inventory) {
                return res.json(products);
            }
            // Inventory statistics
            const totalProducts = await Product.countDocuments();
            const lowStockCount = await Product.countDocuments({
                quantity: { $gt: 0, $lt: Number(low ?? 100) }
            });
            const outOfStockCount = await Product.countDocuments({
                quantity: 0
            });
            return res.json({
                totalProducts,
                lowStockCount,
                outOfStockCount,
                products
            });
        }
        catch (error) {
            res.status(500).json({ message: "Server error", error });
        }
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
