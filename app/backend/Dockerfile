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

# Build the frontend
RUN cd frontend && npm run build

# Expose the backend port
EXPOSE 5000

# Start the backend when container runs
CMD ["node", "backend/index.js"]