# Kubernetes Deployment Project

This project demonstrates how to set up a web application using Kubernetes with Minikube, implementing a CI/CD pipeline using GitHub Actions.

## Project Overview

The project consists of a MERN stack application (MongoDB, Express, React, Node.js) that has been containerized with Docker and deployed to a local Kubernetes cluster using Minikube.

### Features

- Containerized MERN stack application
- Kubernetes deployment with multiple replicas for high availability
- MongoDB database with persistent storage
- CI/CD pipeline using GitHub Actions
- Automatic Docker image building and pushing to Docker Hub

## Prerequisites

Before you begin, ensure you have the following installed:

- [Docker](https://www.docker.com/get-started) (v20.10 or later)
- [Minikube](https://minikube.sigs.k8s.io/docs/start/) (v1.25 or later)
- [kubectl](https://kubernetes.io/docs/tasks/tools/) (v1.25 or later)
- [Node.js](https://nodejs.org/) (v18 or later)
- [npm](https://www.npmjs.com/get-npm) (v9 or later)
- [Git](https://git-scm.com/downloads) (v2.30 or later)

## Project Structure

```
├── app/                        # Application code
│   ├── backend/                # Node.js Express backend
│   └── frontend/               # React frontend
├── k8s/                        # Kubernetes manifests
│   ├── deployment.yaml         # Deployment configuration
│   ├── service.yaml            # Service configuration
│   ├── pvc.yaml                # Persistent Volume Claim
│   └── namespace.yaml          # Namespace definition
├── .github/workflows/          # GitHub Actions workflows
│   └── deploy.yml              # CI/CD workflow
├── Dockerfile                  # Docker image definition
├── docker-compose.yml          # Local development setup
└── README.md                   # Project documentation
```

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/kubernetes-demo.git
cd kubernetes-demo
```

### 2. Local Development with Docker Compose

To run the application locally using Docker Compose:

```bash
docker-compose up -d
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5001/api

### 3. Setting Up Minikube

Start Minikube:

```bash
minikube start
```

Enable the necessary addons:

```bash
minikube addons enable ingress
minikube addons enable metrics-server
```

### 4. Deploying to Kubernetes

Deploy the application to your Minikube cluster:

```bash
# Create namespace
kubectl apply -f k8s/namespace.yaml

# Create persistent volume claim
kubectl apply -f k8s/pvc.yaml

# Deploy application and database
kubectl apply -f k8s/deployment.yaml

# Create services
kubectl apply -f k8s/service.yaml
```

Check the status of your deployments:

```bash
kubectl -n scd-project get all
```

### 5. Accessing the Application

To access the application in your browser:

```bash
minikube service -n scd-project k8s-demo-service
```

This will open the application in your default browser.

## Setting Up GitHub Actions

1. Fork this repository to your GitHub account
2. Set up a self-hosted GitHub Actions runner on your machine
3. Add the following secrets to your GitHub repository:
   - `DOCKER_USERNAME`: Your Docker Hub username
   - `DOCKER_PASSWORD`: Your Docker Hub password

The CI/CD pipeline will automatically:
1. Build the Docker image
2. Push it to Docker Hub
3. Deploy to your local Minikube cluster

## Troubleshooting

### Common Issues

1. **Port conflicts**: If you see "port is already allocated" errors, change the port mapping in docker-compose.yml
2. **Connection to MongoDB fails**: Ensure MongoDB service is running and accessible within the cluster
3. **Images not pulling**: Check your Docker Hub credentials and internet connection
4. **Minikube not starting**: Ensure virtualization is enabled on your system

## License

This project is licensed under the MIT License - see the LICENSE file for details.