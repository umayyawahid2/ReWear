const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Product title is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Description is required']
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: ['Dresses', 'Shirts', 'Pants', 'Shoes', 'Jackets', 'Accessories', 'Other']
    },
    size: {
        type: String,
        required: [true, 'Size is required'],
        enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size']
    },
    brand: {
        type: String,
        default: 'Unbranded',
        trim: true
    },
    condition: {
        type: String,
        required: [true, 'Condition is required'],
        enum: ['Brand New', 'Like New', 'Gently Used', 'Well Worn']
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: 0
    },
    location: {
        type: String,
        required: [true, 'Location is required'],
        trim: true
    },
    image: {
        type: String,
        default: 'placeholder.jpg'
    },
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['available', 'sold'],
        default: 'available'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
