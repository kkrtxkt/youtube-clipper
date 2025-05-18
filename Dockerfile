# Use base image
FROM node:18-bullseye

# Install Python, pip, ffmpeg, and venv
RUN apt-get update && apt-get install -y \
    python3 python3-pip python3-venv ffmpeg curl \
    && apt-get clean

# Create a virtual environment and install yt-dlp inside it
RUN python3 -m venv /venv \
    && /venv/bin/pip install --upgrade pip \
    && /venv/bin/pip install yt-dlp

# Add the virtual environment to PATH so yt-dlp works globally
ENV PATH="/venv/bin:$PATH"

# Set working directory
WORKDIR /app

# Copy app files
COPY . .

# Install Node.js dependencies
RUN npm install

# Build the app
RUN npm run build

# Start app
CMD ["npm", "start"]
