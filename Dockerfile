FROM node:18-alpine

WORKDIR /app

# Install backend dependencies
COPY app/backend/package*.json ./backend/
RUN cd backend && npm install

# Install frontend dependencies
COPY app/frontend/package*.json ./frontend/
RUN cd frontend && npm install

# Copy backend and frontend code
COPY app/backend ./backend
COPY app/frontend ./frontend

# Set environment variable for React app
ENV REACT_APP_API_URL=http://localhost:5000/api

# Build the frontend
RUN cd frontend && npm run build

# Expose both frontend and backend ports
EXPOSE 3000 5000

# Start the backend when container runs
CMD ["node", "backend/index.js"]