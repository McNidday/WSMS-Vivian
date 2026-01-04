import Product from "../models/Product.mjs";

export default {
    getAllProducts: async (req, res) => {
        try {
            const products = await Product.find().sort({ name: 1 });
            res.json(products);
        } catch (error) {
            console.error("Error fetching products:", error);
            res.status(500).json({ message: "Failed to fetch products", error: error.message });
        }
    },
    
    createProduct: async (req, res) => {
        try {
            const { name, price, quantity } = req.body;
            
            if (!name || price === undefined || quantity === undefined) {
                return res.status(400).json({ message: "Name, price, and quantity are required" });
            }
            
            if (price < 0 || quantity < 0) {
                return res.status(400).json({ message: "Price and quantity must be non-negative" });
            }
            
            const product = new Product({ name, price, quantity });
            await product.save();
            res.status(201).json(product);
        } catch (error) {
            console.error("Error creating product:", error);
            res.status(500).json({ message: "Failed to create product", error: error.message });
        }
    },
    
    getProduct: async (req, res) => {
        try {
            const product = await Product.findById(req.params.id);
            if (!product) {
                return res.status(404).json({ message: "Product not found" });
            }
            res.json(product);
        } catch (error) {
            console.error("Error fetching product:", error);
            res.status(500).json({ message: "Failed to fetch product", error: error.message });
        }
    },
    
    updateProduct: async (req, res) => {
        try {
            const { price, quantity } = req.body;
            
            if (price !== undefined && price < 0) {
                return res.status(400).json({ message: "Price must be non-negative" });
            }
            
            if (quantity !== undefined && quantity < 0) {
                return res.status(400).json({ message: "Quantity must be non-negative" });
            }
            
            const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
                new: true,
            });
            
            if (!product) {
                return res.status(404).json({ message: "Product not found" });
            }
            
            res.json(product);
        } catch (error) {
            console.error("Error updating product:", error);
            res.status(500).json({ message: "Failed to update product", error: error.message });
        }
    },
    
    deleteProduct: async (req, res) => {
        try {
            const product = await Product.findByIdAndDelete(req.params.id);
            if (!product) {
                return res.status(404).json({ message: "Product not found" });
            }
            res.json({ message: "Product deleted successfully" });
        } catch (error) {
            console.error("Error deleting product:", error);
            res.status(500).json({ message: "Failed to delete product", error: error.message });
        }
    },
    
    // Inventory management endpoints
    getLowStockProducts: async (req, res) => {
        try {
            const threshold = parseInt(req.query.threshold) || 10;
            const products = await Product.find({ quantity: { $lt: threshold } })
                .sort({ quantity: 1 });
            res.json(products);
        } catch (error) {
            console.error("Error fetching low stock products:", error);
            res.status(500).json({ message: "Failed to fetch low stock products", error: error.message });
        }
    },
    
    getInventoryReport: async (req, res) => {
        try {
            const products = await Product.find();
            const totalProducts = products.length;
            const totalValue = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
            const lowStockCount = products.filter(p => p.quantity < 10).length;
            const outOfStockCount = products.filter(p => p.quantity === 0).length;
            
            res.json({
                totalProducts,
                totalValue,
                lowStockCount,
                outOfStockCount,
                products: products.map(p => ({
                    _id: p._id,
                    name: p.name,
                    quantity: p.quantity,
                    price: p.price,
                    totalValue: p.price * p.quantity,
                    status: p.quantity === 0 ? "out_of_stock" : p.quantity < 10 ? "low_stock" : "in_stock"
                }))
            });
        } catch (error) {
            console.error("Error generating inventory report:", error);
            res.status(500).json({ message: "Failed to generate inventory report", error: error.message });
        }
    }
};
