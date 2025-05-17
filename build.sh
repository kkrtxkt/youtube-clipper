#!/bin/bash

set -e

# Install Python and yt-dlp
echo "Installing Python and yt-dlp..."

apt-get update
apt-get install -y python3 python3-pip

pip3 install yt-dlp

# Install Node.js dependencies
echo "Installing Node modules..."
npm install

# Build your Next.js app
echo "Building app..."
npm run build
