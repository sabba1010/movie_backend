const mongoose = require('mongoose');

const filmSchema = new mongoose.Schema({
    title: { type: String, required: true },
    year: { type: String, required: true },
    duration: { type: String, required: true },
    price: { type: String, required: true },
    rentPrice: { type: String, required: true },
    rating: { type: String, default: '0.0' },
    status: { type: String, default: 'Published' },
    sales: { type: Number, default: 0 },
    purchases: { type: Number, default: 0 },
    thumbnail: { type: String, required: true },
    trailer: { type: String, required: true },
    movieLink: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Film', filmSchema);
