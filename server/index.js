const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');

// Initialize database (creates tables if not exist)
require('./db');

const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5500',
    credentials: true
}));
app.use(express.json());

// Request logging with body for POST
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[SERVER] ${timestamp} - ${req.method} ${req.path}`);

    // Log request body for POST/PUT requests (redact password)
    if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
        const sanitizedBody = { ...req.body };
        if (sanitizedBody.password) {
            sanitizedBody.password = '[REDACTED]';
        }
        console.log('[SERVER] Request body:', JSON.stringify(sanitizedBody));
    }

    // Log response when finished
    res.on('finish', () => {
        const duration = Date.now() - req._startTime;
        console.log(`[SERVER] Response: ${res.statusCode} (${duration}ms)`);
    });

    req._startTime = Date.now();
    next();
});

// Routes
app.use('/api/auth', authRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
    console.log('');
    console.log('🏠 ════════════════════════════════════════════');
    console.log('   VIMMO Authentication Server');
    console.log('════════════════════════════════════════════════');
    console.log(`   Server running on: http://localhost:${PORT}`);
    console.log(`   Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5500'}`);
    console.log('════════════════════════════════════════════════');
    console.log('');
});
