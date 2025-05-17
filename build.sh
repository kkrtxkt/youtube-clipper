#!/bin/bash

# Install Python and yt-dlp using pip
echo "Installing yt-dlp..."
pip install -r requirements.txt

# Install Node.js dependencies
echo "Installing Node modules..."
npm install

# Build your Next.js app
echo "Building app..."
npm run build
