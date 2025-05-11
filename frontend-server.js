const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());

// Serve static files from the frontend build directory
app.use(express.static(path.join(__dirname, 'app/frontend/build')));

// Handle all routes by serving the index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'app/frontend/build', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Frontend server running at http://localhost:${PORT}`);
}); 