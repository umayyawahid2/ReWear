const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Product = require('./models/Product');

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/rewear');
        console.log('Connected to MongoDB for seeding...');

        await User.deleteMany({});
        await Product.deleteMany({});

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        const adminUser = await User.create({
            name: 'ReWear Admin',
            email: 'admin@rewear.com',
            password: hashedPassword,
            phone: '+92 3001112233',
            location: 'Islamabad, Secretariate',
            role: 'admin'
        });

        const user1 = await User.create({
            name: 'Umayya Khan',
            email: 'umayya@example.com',
            password: hashedPassword,
            phone: '+92 3125556677',
            location: 'Islamabad, F-7',
            role: 'user'
        });

        const user2 = await User.create({
            name: 'Ali Raza',
            email: 'ali@example.com',
            password: hashedPassword,
            phone: '+92 3219988776',
            location: 'Lahore, Gulberg',
            role: 'user'
        });

        console.log('Users created with country codes:');
        console.log('Admin:', 'admin@rewear.com / password123');
        console.log('User 1:', 'umayya@example.com / password123');
        console.log('User 2:', 'ali@example.com / password123');

        await Product.create([
            {
                title: 'Zara Summer Floral Dress',
                description: 'Lightweight flowy summer dress with floral prints. Worn only twice for photos. Pristine condition with no stains or tears.',
                category: 'Dresses',
                size: 'M',
                brand: 'Zara',
                condition: 'Like New',
                price: 2500,
                location: 'Islamabad',
                image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=800&auto=format&fit=crop',
                sellerId: user1._id,
                status: 'available'
            },
            {
                title: "Levi's Classic Denim Jacket",
                description: 'Authentic vintage Levi\'s trucker denim jacket in medium wash. Timeless look, super comfortable denim.',
                category: 'Jackets',
                size: 'L',
                brand: "Levi's",
                condition: 'Gently Used',
                price: 4200,
                location: 'Lahore',
                image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?q=80&w=800&auto=format&fit=crop',
                sellerId: user2._id,
                status: 'available'
            },
            {
                title: 'Nike Air Max Sneakers',
                description: 'Original Nike Air Max in white/red colorway. Cleaned and sanitized. Size UK 9 / EU 43.',
                category: 'Shoes',
                size: 'XL',
                brand: 'Nike',
                condition: 'Like New',
                price: 6500,
                location: 'Karachi',
                image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop',
                sellerId: user2._id,
                status: 'available'
            },
            {
                title: 'Oversized Vintage Graphic Tee',
                description: 'Heavyweight 100% cotton street-style t-shirt with retro print. Never worn, tag still attached.',
                category: 'Shirts',
                size: 'L',
                brand: 'H&M',
                condition: 'Brand New',
                price: 1800,
                location: 'Islamabad',
                image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop',
                sellerId: user1._id,
                status: 'available'
            },
            {
                title: 'High-Waisted Straight Leg Jeans',
                description: 'Classic light wash high-waisted denim jeans. Great fit and very durable quality.',
                category: 'Pants',
                size: 'S',
                brand: 'Mango',
                condition: 'Gently Used',
                price: 2800,
                location: 'Rawalpindi',
                image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=800&auto=format&fit=crop',
                sellerId: user1._id,
                status: 'available'
            }
        ]);

        console.log('Sample products seeded successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Seeding error:', err);
        process.exit(1);
    }
};

seedDB();
