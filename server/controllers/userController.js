const User = require('../models/User');
const Product = require('../models/Product');
const Wishlist = require('../models/Wishlist');

const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        const myListings = await Product.find({ sellerId: req.user._id }).sort({ createdAt: -1 });
        
        const wishlistItems = await Wishlist.find({ userId: req.user._id })
            .populate('productId');

        const savedItems = wishlistItems
            .filter(item => item.productId !== null)
            .map(item => item.productId);

        res.json({
            user,
            myListings,
            savedItems
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { name, phone, location } = req.body;

        user.name = name || user.name;
        user.phone = phone || user.phone;
        user.location = location || user.location;

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            phone: updatedUser.phone,
            location: updatedUser.location,
            role: updatedUser.role
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getUserProfile, updateUserProfile };
