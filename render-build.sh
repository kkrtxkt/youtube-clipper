#!/usr/bin/env bash

# Install yt-dlp (Render supports apt-get)
apt-get update && apt-get install -y yt-dlp ffmpeg

# Install dependencies
npm install

# Build the Next.js app
npm run build
