# Use base image
FROM node:18-bullseye

# Install Python, pip, ffmpeg
RUN apt-get update && apt-get install -y \
    python3 python3-pip python3-venv ffmpeg curl \
    && apt-get clean

# Use virtualenv to install yt-dlp safely
RUN python3 -m venv /venv \
    && /venv/bin/pip install --upgrade pip \
    && /venv/bin/pip install yt-dlp

# Add virtualenv to PATH so you can call yt-dlp
ENV PATH="/venv/bin:$PATH"

# Set working directory
WORKDIR /app

# Copy app code
COPY . .

# Install dependencies
RUN npm install

# Build app
RUN npm run build

# Start app
CMD ["npm", "start"]
