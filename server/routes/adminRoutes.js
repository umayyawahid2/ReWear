const express = require('express');
const router = express.Router();
const {
    getAdminStats,
    getAllUsers,
    deleteUser,
    getAllProductsAdmin,
    getReports,
    deleteReport
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.use(protect);
router.use(adminOnly);

router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.get('/products', getAllProductsAdmin);
router.get('/reports', getReports);
router.delete('/reports/:id', deleteReport);

module.exports = router;
