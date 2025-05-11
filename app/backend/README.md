# Kubernetes Demo Application

A MERN stack (MongoDB, Express, React, Node.js) application designed for deployment on Kubernetes with Minikube.

## Features

- Modern React frontend with charts and visualization
- Express.js backend API with MongoDB integration
- Health checks and metrics endpoints for Kubernetes probes
- Environment variable support for Kubernetes ConfigMaps
- Docker and Kubernetes ready
- Task management system (demonstrates database operations)

## Project Structure

```
/
├── app/
│   ├── backend/             # Express.js API
│   │   ├── index.js         # Main server file with all routes
│   │   └── package.json     # Backend dependencies
│   └── frontend/            # React application
│       ├── public/
│       │   └── index.html   # HTML template
│       ├── src/
│       │   ├── App.js       # React components (all-in-one)
│       │   └── index.js     # React entry point
│       └── package.json     # Frontend dependencies
├── Dockerfile               # Container configuration
├── docker-compose.yml       # Local development setup
└── README.md                # Project documentation
```

## Getting Started

### Prerequisites

- Node.js (v16+)
- Docker
- Minikube
- kubectl

### Local Development

1. Install backend dependencies:
   ```
   cd app/backend
   npm install
   ```
2. Install frontend dependencies:
   ```
   cd app/frontend
   npm install
   ```
3. Start the backend:
   ```
   cd app/backend
   npm start
   ```
4. Start the frontend:
   ```
   cd app/frontend
   npm start
   ```
5. Visit `http://localhost:3000` in your browser

### Using Docker

For convenience, you can use Docker Compose to run the entire stack:

```
docker-compose up -d
```

This will start the MongoDB database and the application. Visit `http://localhost:3000` to see the application.

## Kubernetes Features

This application is designed to showcase several Kubernetes features:

1. **Health Checks**: The app includes `/api/health/liveness` and `/api/health/readiness` endpoints for Kubernetes probes
2. **Metrics**: Custom metrics endpoint at `/api/metrics` can be used for monitoring
3. **Environment Variables**: The app reads environment variables that can be set via Kubernetes ConfigMaps
4. **Multiple Services**: Demonstrates how to connect a frontend, backend API, and database
5. **Stateful Data**: MongoDB needs persistent storage, showcasing PersistentVolumeClaims

## Notes

- The application is designed to work without a database if MongoDB is not available
- Environment variables can override default settings like database connection strings
- The Docker containers include health checks to help Kubernetes monitor the application health