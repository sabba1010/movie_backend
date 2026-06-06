require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const filmRoutes = require('./routes/film.routes');
const seriesRoutes = require('./routes/series.routes');
const eventRoutes = require('./routes/event.routes');
const resourceRoutes = require('./routes/resource.routes');
const ticketRoutes = require('./routes/ticket.routes');
const donationRoutes = require('./routes/donation.routes');
const productRoutes = require('./routes/product.routes');
const kidsRoutes = require('./routes/kidsRoutes');
const newsletterRoutes = require('./routes/newsletter.routes');
const contactRoutes = require('./routes/contact.routes');
const heroSliderRoutes = require('./routes/filmSlider.routes');

const campaignRoutes = require('./routes/campaign.routes');
const adminMailRoutes = require('./routes/adminMail.routes');

const uploadRoutes = require('./routes/upload.routes');
const purchaseRoutes = require('./routes/purchase.routes');
const settingRoutes = require('./routes/setting.routes');
const podcastRoutes = require('./routes/podcast.routes');
const prayerRoutes = require('./routes/prayer.routes');
const path = require('path');

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors()); 
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ limit: '500mb', extended: true }));
app.use(cookieParser());

// Serve uploads directory statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/films', filmRoutes);
app.use('/api/series', seriesRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/products', productRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/kids', kidsRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/hero-sliders', heroSliderRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/admin-mail', adminMailRoutes);
app.use('/api/podcast', podcastRoutes);
app.use('/api/prayer', prayerRoutes);

// Default route
app.get('/', (req, res) => {
    res.status(200).json({ success: true, message: 'Welcome to the Cinema Hub Backend API' });
});

// Health check route
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Server Error' });
});

const PORT = process.env.PORT || 5000;

if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;
