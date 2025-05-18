#!/usr/bin/env bash

# Exit immediately if a command exits with a non-zero status
set -e

# Make sure the bin directory exists
mkdir -p ./bin

# Download the latest yt-dlp Linux binary
curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o ./bin/yt-dlp
chmod +x ./bin/yt-dlp

# Add bin to PATH for this build step
export PATH=$PWD/bin:$PATH

# Persist this path to .env so Next.js API routes can find it
if ! grep -q "PATH=$PWD/bin" .env 2>/dev/null; then
  echo "PATH=$PWD/bin:\$PATH" >> .env
fi

# Install ffmpeg (Render uses Debian-based Linux images)
apt-get update && apt-get install -y ffmpeg

# Install dependencies and build the Next.js app
npm install
npm run build
