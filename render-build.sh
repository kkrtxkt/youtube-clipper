#!/usr/bin/env bash

# Stop the script if anything fails
set -o errexit

# Install yt-dlp and ffmpeg
apt-get update && apt-get install -y yt-dlp ffmpeg

# Run the normal Next.js build
npm run build
