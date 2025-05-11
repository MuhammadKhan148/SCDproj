import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

// Get the API URL from environment or default to localhost
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Main App Component
function App() {
    const [serverInfo, setServerInfo] = useState(null);
    const [metrics, setMetrics] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [env, setEnv] = useState({});
    const [health, setHealth] = useState({ status: 'unknown' });

    // Fetch server info
    const fetchServerInfo = async () => {
        try {
            const response = await axios.get(`${API_URL}/info`);
            setServerInfo(response.data);
        } catch (err) {
            console.error('Error fetching server info:', err);
            setError('Failed to fetch server information');
        }
    };

    // Fetch metrics
    const fetchMetrics = async () => {
        try {
            const response = await axios.get(`${API_URL}/metrics`);
            setMetrics(response.data);
        } catch (err) {
            console.error('Error fetching metrics:', err);
        }
    };

    // Fetch tasks
    const fetchTasks = async () => {
        try {
            const response = await axios.get(`${API_URL}/tasks`);
            setTasks(response.data);
        } catch (err) {
            console.error('Error fetching tasks:', err);
        }
    };

    // Fetch environment variables
    const fetchEnv = async () => {
        try {
            const response = await axios.get(`${API_URL}/env`);
            setEnv(response.data);
        } catch (err) {
            console.error('Error fetching environment:', err);
        }
    };

    // Fetch health status
    const fetchHealth = async () => {
        try {
            const response = await axios.get(`${API_URL}/health/readiness`);
            setHealth(response.data);
        } catch (err) {
            console.error('Error fetching health status:', err);
            setHealth({ status: 'error', message: 'Cannot connect to backend' });
        }
    };

    // Fetch all data on component mount
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            await Promise.all([
                fetchServerInfo(),
                fetchMetrics(),
                fetchTasks(),
                fetchEnv(),
                fetchHealth()
            ]);
            setLoading(false);
        };

        fetchData();

        // Refresh metrics every 30 seconds
        const metricsInterval = setInterval(fetchMetrics, 30000);
        // Refresh server info every minute
        const infoInterval = setInterval(fetchServerInfo, 60000);
        // Refresh health check every 15 seconds
        const healthInterval = setInterval(fetchHealth, 15000);

        return () => {
            clearInterval(metricsInterval);
            clearInterval(infoInterval);
            clearInterval(healthInterval);
        };
    }, []);

    // Add a new task
    const addTask = async (task) => {
        try {
            const response = await axios.post(`${API_URL}/tasks`, task);
            setTasks([response.data, ...tasks]);
        } catch (err) {
            console.error('Error adding task:', err);
        }
    };

    // Update a task
    const updateTask = async (id, updatedTask) => {
        try {
            const response = await axios.patch(`${API_URL}/tasks/${id}`, updatedTask);
            setTasks(
                tasks.map((task) => (task._id === id ? response.data : task))
            );
        } catch (err) {
            console.error('Error updating task:', err);
        }
    };

    // Delete a task
    const deleteTask = async (id) => {
        try {
            await axios.delete(`${API_URL}/tasks/${id}`);
            setTasks(tasks.filter((task) => task._id !== id));
        } catch (err) {
            console.error('Error deleting task:', err);
        }
    };

    if (loading) {
        return (
            <div className="container mt-5 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3">Loading application data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mt-5">
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
                <p className="mt-3">
                    Please check if the backend service is running and accessible.
                </p>
                <button className="btn btn-primary" onClick={() => window.location.reload()}>
                    Reload
                </button>
            </div>
        );
    }

    return (
        <div className="container-fluid px-4 py-2">
            <Header
                env={env}
                health={health}
            />

            <div className="row mt-4">
                <div className="col-md-6">
                    <Dashboard
                        serverInfo={serverInfo}
                        metrics={metrics}
                    />
                </div>
                <div className="col-md-6">
                    <ServerInfo serverInfo={serverInfo} />
                </div>
            </div>

            <div className="row mt-4 mb-5">
                <div className="col-12">
                    <TaskList
                        tasks={tasks}
                        onAddTask={addTask}
                        onUpdateTask={updateTask}
                        onDeleteTask={deleteTask}
                    />
                </div>
            </div>
        </div>
    );
}

// Header Component
const Header = ({ env, health }) => {
    // Determine health status badge
    const getHealthBadge = () => {
        switch (health.status) {
            case 'ok':
                return 'bg-success';
            case 'warning':
                return 'bg-warning';
            case 'error':
                return 'bg-danger';
            default:
                return 'bg-secondary';
        }
    };

    return (
        <div className="row border-bottom pb-2">
            <div className="col-md-8">
                <h1 className="display-5">Kubernetes Demo Application</h1>
                <p className="lead text-muted">
                    A MERN stack app deployed in Kubernetes using Minikube
                </p>
            </div>
            <div className="col-md-4 text-end d-flex flex-column justify-content-center">
                <div className="mb-2">
                    <span className="badge bg-info me-2">ENV: {env.NODE_ENV || 'local'}</span>
                    <span className="badge bg-primary me-2">K8s: {env.K8S_CLUSTER || 'minikube'}</span>
                    <span className="badge bg-dark">v{env.APP_VERSION || '1.0.0'}</span>
                </div>
                <div>
                    <span className={`badge ${getHealthBadge()} me-2`}>
                        Health: {health.status || 'unknown'}
                    </span>
                    <span className="badge bg-secondary">ID: {env.DEPLOYMENT_ID || 'local'}</span>
                </div>
            </div>
        </div>
    );
};

// Dashboard Component
const Dashboard = ({ serverInfo, metrics }) => {
    // Prepare memory data for chart
    const memoryData = {
        labels: ['Total Memory', 'Free Memory'],
        datasets: [
            {
                label: 'Memory (MB)',
                data: metrics ? [
                    Math.round(metrics.memory.total / (1024 * 1024)),
                    Math.round(metrics.memory.free / (1024 * 1024))
                ] : [0, 0],
                backgroundColor: ['rgba(54, 162, 235, 0.6)', 'rgba(75, 192, 192, 0.6)'],
                borderColor: ['rgba(54, 162, 235, 1)', 'rgba(75, 192, 192, 1)'],
                borderWidth: 1,
            },
        ],
    };

    // Chart options
    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Server Memory',
            },
        },
    };

    // Format uptime
    const formatUptime = (seconds) => {
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = Math.floor(seconds % 60);

        return `${days}d ${hours}h ${minutes}m ${remainingSeconds}s`;
    };

    return (
        <div className="card h-100">
            <div className="card-header bg-primary text-white">
                <h4 className="mb-0">System Dashboard</h4>
            </div>
            <div className="card-body">
                <div className="row mb-4">
                    <div className="col-md-6">
                        <div className="card bg-light">
                            <div className="card-body text-center">
                                <h6 className="card-title">CPU Cores</h6>
                                <p className="display-4 mb-0">
                                    {serverInfo ? serverInfo.cpus : '-'}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="card bg-light">
                            <div className="card-body text-center">
                                <h6 className="card-title">Uptime</h6>
                                <p className="h5 mb-0">
                                    {metrics ? formatUptime(metrics.uptime) : '-'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-12">
                        <Bar data={memoryData} options={chartOptions} />
                    </div>
                </div>

                {metrics && (
                    <div className="row mt-3">
                        <div className="col-12">
                            <div className="card bg-light">
                                <div className="card-body">
                                    <h6 className="card-title">Load Average (1m, 5m, 15m)</h6>
                                    <div className="progress mb-1" style={{ height: '20px' }}>
                                        <div
                                            className="progress-bar"
                                            role="progressbar"
                                            style={{ width: `${Math.min(metrics.cpu.load[0] * 100 / metrics.cpu.cores, 100)}%` }}
                                            aria-valuenow={metrics.cpu.load[0]}
                                            aria-valuemin="0"
                                            aria-valuemax={metrics.cpu.cores}
                                        >
                                            {metrics.cpu.load[0].toFixed(2)}
                                        </div>
                                    </div>
                                    <div className="progress mb-1" style={{ height: '20px' }}>
                                        <div
                                            className="progress-bar bg-info"
                                            role="progressbar"
                                            style={{ width: `${Math.min(metrics.cpu.load[1] * 100 / metrics.cpu.cores, 100)}%` }}
                                            aria-valuenow={metrics.cpu.load[1]}
                                            aria-valuemin="0"
                                            aria-valuemax={metrics.cpu.cores}
                                        >
                                            {metrics.cpu.load[1].toFixed(2)}
                                        </div>
                                    </div>
                                    <div className="progress" style={{ height: '20px' }}>
                                        <div
                                            className="progress-bar bg-secondary"
                                            role="progressbar"
                                            style={{ width: `${Math.min(metrics.cpu.load[2] * 100 / metrics.cpu.cores, 100)}%` }}
                                            aria-valuenow={metrics.cpu.load[2]}
                                            aria-valuemin="0"
                                            aria-valuemax={metrics.cpu.cores}
                                        >
                                            {metrics.cpu.load[2].toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Server Info Component
const ServerInfo = ({ serverInfo }) => {
    if (!serverInfo) {
        return (
            <div className="card h-100">
                <div className="card-header bg-secondary text-white">
                    <h4 className="mb-0">Server Information</h4>
                </div>
                <div className="card-body">
                    <p className="text-muted">Loading server information...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="card h-100">
            <div className="card-header bg-dark text-white">
                <h4 className="mb-0">Server Information</h4>
            </div>
            <div className="card-body">
                <table className="table table-striped">
                    <tbody>
                        <tr>
                            <th>Hostname</th>
                            <td>{serverInfo.hostname}</td>
                        </tr>
                        <tr>
                            <th>Platform</th>
                            <td>{serverInfo.platform}</td>
                        </tr>
                        <tr>
                            <th>Architecture</th>
                            <td>{serverInfo.arch}</td>
                        </tr>
                        <tr>
                            <th>Node.js Version</th>
                            <td>{serverInfo.nodeVersion}</td>
                        </tr>
                        <tr>
                            <th>Environment</th>
                            <td>
                                <span className="badge bg-info">{serverInfo.env}</span>
                            </td>
                        </tr>
                        <tr>
                            <th>Total Memory</th>
                            <td>{serverInfo.memory.total}</td>
                        </tr>
                        <tr>
                            <th>Free Memory</th>
                            <td>{serverInfo.memory.free}</td>
                        </tr>
                        <tr>
                            <th>Network Interfaces</th>
                            <td>
                                {serverInfo.network.map((net, index) => (
                                    <div key={index}>
                                        <strong>{net.name}:</strong>{' '}
                                        {net.addresses.join(', ')}
                                    </div>
                                ))}
                            </td>
                        </tr>
                        <tr>
                            <th>Last Updated</th>
                            <td>
                                {new Date(serverInfo.timestamp).toLocaleString()}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// Task List Component
const TaskList = ({ tasks, onAddTask, onUpdateTask, onDeleteTask }) => {
    const [newTask, setNewTask] = useState({ title: '', description: '', status: 'pending' });
    const [isFormVisible, setIsFormVisible] = useState(false);

    const handleAddTask = (e) => {
        e.preventDefault();
        if (newTask.title.trim() === '') return;

        onAddTask(newTask);
        setNewTask({ title: '', description: '', status: 'pending' });
        setIsFormVisible(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewTask({ ...newTask, [name]: value });
    };

    const handleStatusChange = (id, status) => {
        onUpdateTask(id, { status });
    };

    // Get the status badge class
    const getStatusBadge = (status) => {
        switch (status) {
            case 'completed':
                return 'bg-success';
            case 'in-progress':
                return 'bg-primary';
            default:
                return 'bg-warning';
        }
    };

    return (
        <div className="card">
            <div className="card-header bg-info text-white d-flex justify-content-between align-items-center">
                <h4 className="mb-0">Task Manager</h4>
                <button
                    className="btn btn-light"
                    onClick={() => setIsFormVisible(!isFormVisible)}
                >
                    {isFormVisible ? 'Cancel' : 'Add Task'}
                </button>
            </div>

            {isFormVisible && (
                <div className="card-body border-bottom">
                    <form onSubmit={handleAddTask}>
                        <div className="mb-3">
                            <label htmlFor="title" className="form-label">Task Title</label>
                            <input
                                type="text"
                                className="form-control"
                                id="title"
                                name="title"
                                value={newTask.title}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="description" className="form-label">Description</label>
                            <textarea
                                className="form-control"
                                id="description"
                                name="description"
                                value={newTask.description}
                                onChange={handleInputChange}
                                rows="2"
                            ></textarea>
                        </div>
                        <div className="mb-3">
                            <label htmlFor="status" className="form-label">Status</label>
                            <select
                                className="form-select"
                                id="status"
                                name="status"
                                value={newTask.status}
                                onChange={handleInputChange}
                            >
                                <option value="pending">Pending</option>
                                <option value="in-progress">In Progress</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                        <button type="submit" className="btn btn-primary">Submit</button>
                    </form>
                </div>
            )}

            <div className="card-body">
                {tasks.length === 0 ? (
                    <p className="text-center text-muted py-3">No tasks yet. Add one to get started!</p>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-hover">
                            <thead>
                                <tr>
                                    <th style={{ width: '30%' }}>Title</th>
                                    <th style={{ width: '40%' }}>Description</th>
                                    <th style={{ width: '15%' }}>Status</th>
                                    <th style={{ width: '15%' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tasks.map((task) => (
                                    <tr key={task._id}>
                                        <td>{task.title}</td>
                                        <td>{task.description}</td>
                                        <td>
                                            <div className="dropdown">
                                                <button
                                                    className={`btn btn-sm badge ${getStatusBadge(task.status)} dropdown-toggle`}
                                                    type="button"
                                                    data-bs-toggle="dropdown"
                                                    aria-expanded="false"
                                                >
                                                    {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                                                </button>
                                                <ul className="dropdown-menu">
                                                    <li>
                                                        <a
                                                            className="dropdown-item"
                                                            href="#"
                                                            onClick={() => handleStatusChange(task._id, 'pending')}
                                                        >
                                                            Pending
                                                        </a>
                                                    </li>
                                                    <li>
                                                        <a
                                                            className="dropdown-item"
                                                            href="#"
                                                            onClick={() => handleStatusChange(task._id, 'in-progress')}
                                                        >
                                                            In Progress
                                                        </a>
                                                    </li>
                                                    <li>
                                                        <a
                                                            className="dropdown-item"
                                                            href="#"
                                                            onClick={() => handleStatusChange(task._id, 'completed')}
                                                        >
                                                            Completed
                                                        </a>
                                                    </li>
                                                </ul>
                                            </div>
                                        </td>
                                        <td>
                                            <button
                                                className="btn btn-sm btn-danger"
                                                onClick={() => onDeleteTask(task._id)}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default App;