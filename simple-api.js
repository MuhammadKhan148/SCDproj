const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Enable CORS for all routes
app.use(cors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204
}));

// Log all requests
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} from ${req.ip}`);
    console.log('Headers:', JSON.stringify(req.headers));
    next();
});

// Health check endpoint
app.get('/api/health/liveness', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

// Info endpoint
app.get('/api/info', (req, res) => {
    res.json({
        service: 'Simple API Server',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Simple API server running at http://localhost:${PORT}`);
    console.log(`Test endpoint: http://localhost:${PORT}/api/health/liveness`);
}); 