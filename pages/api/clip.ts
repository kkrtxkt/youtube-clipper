import type { NextApiRequest, NextApiResponse } from 'next';
import { exec } from 'child_process';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import util from 'util';

const execPromise = util.promisify(exec);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url, start, end, format } = req.body;

  if (!url || !start || !end || !format) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const id = uuidv4();
  const ext = format === 'audio' ? 'mp3' : 'mp4';
  const outputDir = path.join(process.cwd(), 'temp');
  const outputPath = path.join(outputDir, `${id}.${ext}`);
  const section = `*${start}-${end}`;

  try {
    // Ensure temp directory exists
    fs.mkdirSync(outputDir, { recursive: true });

    const args = [
      'yt-dlp',
      '--download-sections',
      `"${section}"`
    ];

    // Format-specific flags
    if (format === 'audio') {
      args.push('-x', '--audio-format', 'mp3');
    } else {
      args.push('--merge-output-format', 'mp4');
    }

    // Add cookies.txt if available
    const cookiesPath = path.join(process.cwd(), 'cookies.txt');
    if (fs.existsSync(cookiesPath)) {
      console.log('✅ Using cookies from:', cookiesPath);
      args.push('--cookies', `"${cookiesPath}"`);
    } else {
      console.warn('⚠️ cookies.txt not found at', cookiesPath);
    }

    // Add proxy if defined in environment
    const proxy = process.env.YTDLP_PROXY;
    if (proxy) {
      args.push('--proxy', `"${proxy}"`);
      console.log('🧭 Using proxy:', proxy);
    }

    args.push('-o', `"${outputPath}"`, `"${url}"`);

    const fullCommand = args.join(' ');
    console.log('▶️ Executing command:', fullCommand);

    const { stderr } = await execPromise(fullCommand);

    if (stderr && stderr.includes('HTTP Error 429')) {
      console.error('[clip.ts ERROR] Rate limited by YouTube');
      return res.status(429).json({
        error: 'YouTube is currently limiting access (HTTP 429). Try again later.',
      });
    }

    // Stream file
    res.setHeader('Content-Type', format === 'audio' ? 'audio/mpeg' : 'video/mp4');
    res.setHeader('Content-Disposition', `attachment; filename="clip.${ext}"`);

    const readStream = fs.createReadStream(outputPath);
    readStream.pipe(res);

    readStream.on('close', () => {
      fs.unlink(outputPath, (err) => {
        if (err) console.error('Failed to delete temp file:', err);
      });
    });

  } catch (error: unknown) {
    const err = error as { stderr?: string; message?: string };
    console.error('[clip.ts ERROR]', err.stderr || err.message || err);
    res.status(500).json({
      error:
        err.stderr && err.stderr.includes('429')
          ? 'YouTube is currently rate limiting this server. Try again later.'
          : 'Something went wrong during processing.',
    });
  }
}
