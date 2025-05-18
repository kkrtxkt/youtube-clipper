# Use official Node.js image
FROM node:18-slim

# Install ffmpeg and dependencies
RUN apt-get update && apt-get install -y ffmpeg python3 python3-pip curl && \
    apt-get clean

# Install yt-dlp
RUN pip install yt-dlp

# Set working directory
WORKDIR /app

# Copy files
COPY . .

# Install dependencies
RUN npm install

# Build Next.js app
RUN npm run build

# Expose port
EXPOSE 3000

# Start app
CMD ["npm", "start"]
