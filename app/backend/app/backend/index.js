const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const os = require('os');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// MongoDB Connection and Schema
// Task Schema
const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['pending', 'in-progress', 'completed'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Task = mongoose.model('Task', taskSchema);

// Connect to MongoDB
const connectDB = async () => {
    try {
        // Use environment variable or default to local MongoDB
        const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/k8s-demo';

        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log('MongoDB connected');

        // Add some sample data if the collection is empty
        const count = await Task.countDocuments();
        if (count === 0) {
            await Task.create([
                { title: 'Setup Kubernetes', description: 'Install Minikube and kubectl', status: 'completed' },
                { title: 'Create Web App', description: 'Develop a simple web application', status: 'completed' },
                { title: 'Containerize App', description: 'Create Dockerfile and build image', status: 'in-progress' },
                { title: 'Deploy to Kubernetes', description: 'Create K8s manifests and deploy', status: 'pending' },
                { title: 'Setup CI/CD', description: 'Configure GitHub Actions', status: 'pending' }
            ]);
            console.log('Sample data added');
        }
    } catch (error) {
        console.error('MongoDB connection error:', error.message);
        // Don't crash the application if MongoDB is not available
        console.log('Continuing without MongoDB connection');
    }
};

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Serve static files from the React build folder
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Health Routes
// Health check endpoint - useful for Kubernetes liveness probe
app.get('/api/health/liveness', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Readiness probe - checks if database connection is healthy
app.get('/api/health/readiness', (req, res) => {
    // Check MongoDB connection state
    const dbState = mongoose.connection.readyState;
    const dbStateMap = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
    };

    if (dbState === 1) {
        res.status(200).json({
            status: 'ok',
            message: 'Server is ready to accept requests',
            database: dbStateMap[dbState]
        });
    } else {
        // Still return 200 for now since we want to be fault-tolerant
        // In a real app, you might want to return 503 Service Unavailable
        res.status(200).json({
            status: 'warning',
            message: 'Server is running but database connection is not optimal',
            database: dbStateMap[dbState]
        });
    }
});

// Metrics Routes
// Simple metrics for monitoring
app.get('/api/metrics', (req, res) => {
    const metrics = {
        uptime: process.uptime(),
        timestamp: Date.now(),
        memory: {
            total: os.totalmem(),
            free: os.freemem(),
            usage: process.memoryUsage()
        },
        cpu: {
            load: os.loadavg(),
            cores: os.cpus().length
        }
    };

    res.json(metrics);
});

// Task Routes
// Get all tasks
app.get('/api/tasks', async (req, res) => {
    try {
        const tasks = await Task.find().sort({ createdAt: -1 });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get task by ID
app.get('/api/tasks/:id', async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: 'Task not found' });
        res.json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create new task
app.post('/api/tasks', async (req, res) => {
    try {
        const newTask = new Task(req.body);
        const savedTask = await newTask.save();
        res.status(201).json(savedTask);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update task
app.patch('/api/tasks/:id', async (req, res) => {
    try {
        const updatedTask = await Task.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updatedTask) return res.status(404).json({ message: 'Task not found' });
        res.json(updatedTask);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete task
app.delete('/api/tasks/:id', async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);
        if (!task) return res.status(404).json({ message: 'Task not found' });
        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Server info endpoint
app.get('/api/info', (req, res) => {
    const serverInfo = {
        hostname: os.hostname(),
        platform: os.platform(),
        arch: os.arch(),
        cpus: os.cpus().length,
        memory: {
            total: Math.round(os.totalmem() / (1024 * 1024)) + ' MB',
            free: Math.round(os.freemem() / (1024 * 1024)) + ' MB',
        },
        network: Object.keys(os.networkInterfaces()).map(name => ({
            name,
            addresses: os.networkInterfaces()[name]
                .filter(net => net.family === 'IPv4')
                .map(net => net.address)
        })),
        uptime: os.uptime(),
        nodeVersion: process.version,
        env: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
    };
    res.json(serverInfo);
});

// Environment variables endpoint (useful for demonstrating ConfigMaps)
app.get('/api/env', (req, res) => {
    // Only return safe environment variables
    const safeEnv = {
        NODE_ENV: process.env.NODE_ENV || 'development',
        K8S_CLUSTER: process.env.K8S_CLUSTER || 'minikube',
        APP_VERSION: process.env.APP_VERSION || '1.0.0',
        DEPLOYMENT_ID: process.env.DEPLOYMENT_ID || 'local'
    };
    res.json(safeEnv);
});

// For any request that doesn't match an API route, send the React app
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
    console.log(`Hostname: ${os.hostname()}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});