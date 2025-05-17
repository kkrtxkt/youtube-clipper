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

  try {
    // Ensure temp directory exists
    fs.mkdirSync(outputDir, { recursive: true });

    // Path to the locally installed yt-dlp binary (placed by render-build.sh)
    const ytDlpPath = path.join(process.cwd(), 'bin', 'yt-dlp');
    const section = `*${start}-${end}`;

    const command =
      format === 'audio'
        ? `"${ytDlpPath}" --download-sections "${section}" -x --audio-format mp3 -o "${outputPath}" "${url}"`
        : `"${ytDlpPath}" --download-sections "${section}" --merge-output-format mp4 -o "${outputPath}" "${url}"`;

    await execPromise(command);

    // Stream the file to the client
    res.setHeader('Content-Type', format === 'audio' ? 'audio/mpeg' : 'video/mp4');
    res.setHeader('Content-Disposition', `attachment; filename="clip.${ext}"`);

    const readStream = fs.createReadStream(outputPath);
    readStream.pipe(res);

    // Delete the file after streaming is done
    readStream.on('close', () => {
      fs.unlink(outputPath, (err) => {
        if (err) console.error('Failed to delete temp file:', err);
      });
    });

  } catch (error) {
    console.error('[clip.ts ERROR]', error);
    res.status(500).json({ error: 'Something went wrong during processing.' });
  }
}
