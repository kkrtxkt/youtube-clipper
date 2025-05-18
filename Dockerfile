FROM node:18-bullseye

# Install Python, pip, venv, and ffmpeg
RUN apt-get update && apt-get install -y \
    python3 python3-pip python3-venv ffmpeg curl \
    && apt-get clean

# Set up Python virtual environment
RUN python3 -m venv /venv && \
    /venv/bin/pip install --upgrade pip && \
    /venv/bin/pip install yt-dlp

# Add virtual env to PATH so yt-dlp works globally
ENV PATH="/venv/bin:$PATH"

# Set working directory
WORKDIR /app

# Copy app files
COPY . .

# ⛏️ Fix permissions for yt-dlp
RUN chmod +x /app/bin/yt-dlp

# Install Node dependencies
RUN npm install

# Build the app
RUN npm run build

# Start the app
CMD ["npm", "start"]
