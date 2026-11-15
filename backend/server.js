const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const SearchHistory = require('./models/SearchHistory');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;

// MongoDB Atlas Connection
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB Atlas Connected Successfully'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// Test Route (Vercel par link kholne par check karne ke liye)
app.get('/', (req, res) => {
    res.send('Weather FYP Backend is Live and Running!');
});

// Weather API Route (Matches Frontend: /api/weather/:city)
app.get('/api/weather/:city', async (req, res) => {
    try {
        const cityName = req.params.city;
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityName)}&units=metric&appid=${WEATHER_API_KEY}`;

        const response = await fetch(weatherUrl);
        const weatherData = await response.json();

        if (!response.ok) {
            return res.status(404).json({ error: 'City not found' });
        }

        // Extract required fields
        const city = weatherData.name;
        const country = weatherData.sys ? weatherData.sys.country : '';
        const temp = Math.round(weatherData.main.temp);
        const condition = weatherData.weather[0].description;
        const windSpeed = weatherData.wind.speed;
        const humidity = weatherData.main.humidity;
        const clouds = weatherData.clouds ? weatherData.clouds.all : 0;

        // Save Search History to MongoDB Atlas
        try {
            await SearchHistory.create({
                city,
                country,
                temperature: temp,
                condition
            });
        } catch (dbErr) {
            console.error('Error saving history to MongoDB:', dbErr);
        }

        // Send formatted response to frontend
        res.json({
            city,
            country,
            temp,
            condition,
            windSpeed,
            humidity,
            clouds
        });

    } catch (err) {
        console.error('Server Error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Start Server (Local aur Vercel dono ke liye)
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
}

module.exports = app;