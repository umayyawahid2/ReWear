const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

const getWishlist = async (req, res) => {
    try {
        const wishlistItems = await Wishlist.find({ userId: req.user._id })
            .populate({
                path: 'productId',
                populate: { path: 'sellerId', select: 'name email phone location' }
            })
            .sort({ createdAt: -1 });

        const products = wishlistItems
            .filter(item => item.productId !== null)
            .map(item => item.productId);

        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const toggleWishlist = async (req, res) => {
    try {
        const productId = req.params.productId;
        const userId = req.user._id;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const existingItem = await Wishlist.findOne({ userId, productId });

        if (existingItem) {
            await existingItem.deleteOne();
            res.json({ wishlisted: false, message: 'Removed from wishlist' });
        } else {
            await Wishlist.create({ userId, productId });
            res.json({ wishlisted: true, message: 'Added to wishlist' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const checkWishlistStatus = async (req, res) => {
    try {
        const existingItem = await Wishlist.findOne({
            userId: req.user._id,
            productId: req.params.productId
        });
        res.json({ wishlisted: !!existingItem });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getWishlist, toggleWishlist, checkWishlistStatus };
