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

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors()); 
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/films', filmRoutes);
app.use('/api/series', seriesRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/resources', resourceRoutes);

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

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
