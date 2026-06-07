require('dotenv').config();
const mongoose = require('mongoose');
const PromoCode = require('./src/models/PromoCode');

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to DB.");
        
        // Remove existing first to avoid duplicate errors
        await PromoCode.deleteMany({ code: 'SAVE20' });
        
        const promo = await PromoCode.create({
            code: 'SAVE20',
            discountPercentage: 20,
            maxUses: 0
        });
        
        console.log("Created Promo Code: SAVE20 (20% off)");
        process.exit(0);
    } catch (err) {
        console.error("Failed to seed:", err);
        process.exit(1);
    }
};

seed();
