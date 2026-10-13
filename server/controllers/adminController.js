const User = require('../models/User');
const Product = require('../models/Product');
const Report = require('../models/Report');
const Wishlist = require('../models/Wishlist');

const getAdminStats = async (req, res) => {
    try {
        const usersCount = await User.countDocuments();
        const productsCount = await Product.countDocuments();
        const reportsCount = await Report.countDocuments({ status: 'pending' });

        res.json({
            users: usersCount,
            products: productsCount,
            reports: reportsCount
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: 'You cannot delete your own admin account' });
        }

        const userProducts = await Product.find({ sellerId: user._id });
        const productIds = userProducts.map(p => p._id);

        await Wishlist.deleteMany({ $or: [{ userId: user._id }, { productId: { $in: productIds } }] });
        await Report.deleteMany({ $or: [{ reportedBy: user._id }, { productId: { $in: productIds } }] });
        await Product.deleteMany({ sellerId: user._id });
        await user.deleteOne();

        res.json({ message: 'User and all associated listings deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllProductsAdmin = async (req, res) => {
    try {
        const products = await Product.find()
            .populate('sellerId', 'name email')
            .sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getReports = async (req, res) => {
    try {
        const reports = await Report.find()
            .populate({
                path: 'productId',
                populate: { path: 'sellerId', select: 'name email' }
            })
            .populate('reportedBy', 'name email')
            .sort({ createdAt: -1 });
        res.json(reports);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteReport = async (req, res) => {
    try {
        const report = await Report.findById(req.params.id);
        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }
        await report.deleteOne();
        res.json({ message: 'Report dismissed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAdminStats,
    getAllUsers,
    deleteUser,
    getAllProductsAdmin,
    getReports,
    deleteReport
};
