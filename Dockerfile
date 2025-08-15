# Use Node.js base image with Python support
FROM node:18-bullseye

# Install Python and pip
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-dev \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Create symlink for python command
RUN ln -s /usr/bin/python3 /usr/bin/python

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Copy Python requirements first for better caching
COPY requirements.txt ./

# Install Python dependencies with more robust error handling
RUN pip3 install --no-cache-dir --upgrade pip && \
    pip3 install --no-cache-dir -r requirements.txt || \
    (echo "Warning: Some Python packages failed to install, continuing..." && \
     pip3 install --no-cache-dir requests websocket-client aiohttp urllib3 certifi)

# Install Node.js dependencies
RUN npm install

# Copy application code
COPY . .

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV PYTHON_PATH=python3

# Start the application
CMD ["npm", "start"]
