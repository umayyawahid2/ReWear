const Product = require('../models/Product');
const Report = require('../models/Report');
const Wishlist = require('../models/Wishlist');

const getProducts = async (req, res) => {
    try {
        const { search, category, size, condition, location, minPrice, maxPrice, status, sellerId } = req.query;

        let query = {};

        if (status) {
            query.status = status;
        } else {
            query.status = 'available';
        }

        if (sellerId) {
            query.sellerId = sellerId;
        }

        if (category && category !== 'All') {
            query.category = category;
        }

        if (size && size !== 'All') {
            query.size = size;
        }

        if (condition && condition !== 'All') {
            query.condition = condition;
        }

        if (location && location.trim() !== '') {
            query.location = { $regex: location, $options: 'i' };
        }

        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        if (search && search.trim() !== '') {
            const searchRegex = { $regex: search, $options: 'i' };
            query.$or = [
                { title: searchRegex },
                { description: searchRegex },
                { brand: searchRegex }
            ];
        }

        const products = await Product.find(query)
            .populate('sellerId', 'name email phone location')
            .sort({ createdAt: -1 });

        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('sellerId', 'name email phone location createdAt');

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createProduct = async (req, res) => {
    try {
        const { title, description, category, size, brand, condition, price, location } = req.body;

        let image = 'placeholder.jpg';
        if (req.file) {
            image = req.file.filename;
        }

        const product = new Product({
            title,
            description,
            category,
            size,
            brand: brand || 'Unbranded',
            condition,
            price: Number(price),
            location: location || req.user.location,
            image,
            sellerId: req.user._id
        });

        const createdProduct = await product.save();
        res.status(201).json(createdProduct);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (product.sellerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to edit this product' });
        }

        const { title, description, category, size, brand, condition, price, location, status } = req.body;

        product.title = title || product.title;
        product.description = description || product.description;
        product.category = category || product.category;
        product.size = size || product.size;
        product.brand = brand || product.brand;
        product.condition = condition || product.condition;
        product.price = price !== undefined ? Number(price) : product.price;
        product.location = location || product.location;
        product.status = status || product.status;

        if (req.file) {
            product.image = req.file.filename;
        }

        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (product.sellerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete this product' });
        }

        await Wishlist.deleteMany({ productId: product._id });
        await Report.deleteMany({ productId: product._id });
        await product.deleteOne();

        res.json({ message: 'Product removed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const toggleSoldStatus = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (product.sellerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        product.status = product.status === 'available' ? 'sold' : 'available';
        await product.save();

        res.json({ message: `Product marked as ${product.status}`, status: product.status });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const reportProduct = async (req, res) => {
    try {
        const { reason } = req.body;
        if (!reason) {
            return res.status(400).json({ message: 'Reason is required' });
        }

        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const report = await Report.create({
            productId: req.params.id,
            reportedBy: req.user._id,
            reason
        });

        res.status(201).json({ message: 'Product reported successfully', report });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleSoldStatus,
    reportProduct
};
