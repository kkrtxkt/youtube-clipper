#!/usr/bin/env bash

# Make a local bin directory and add it to PATH
mkdir -p ./bin
curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o ./bin/yt-dlp
chmod +x ./bin/yt-dlp
export PATH=$PWD/bin:$PATH

# Save this PATH export in a .env file so your app can find it at runtime
echo "PATH=$PWD/bin:\$PATH" >> .env

# Install ffmpeg
apt-get update && apt-get install -y ffmpeg

# Continue with normal build
npm install
npm run build
