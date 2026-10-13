const express = require('express');
const router = express.Router();
const { getWishlist, toggleWishlist, checkWishlistStatus } = require('../controllers/wishlistController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getWishlist);
router.post('/:productId', protect, toggleWishlist);
router.get('/check/:productId', protect, checkWishlistStatus);

module.exports = router;
