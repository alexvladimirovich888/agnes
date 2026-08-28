import { processChat } from '../src/lib/chatEngine.ts';

// Vercel Serverless Function Handler for /api/chat
export default async function handler(req: any, res: any) {
  // CORS & Preflight handling
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        return res.status(400).json({ error: 'Invalid JSON payload' });
      }
    }

    if (!body || typeof body !== 'object') {
      return res.status(400).json({ error: 'Missing request body' });
    }

    const result = await processChat(body);

    if (result.error) {
      return res.status(result.reply ? 200 : 502).json(result);
    }

    return res.status(200).json(result);
  } catch (err: any) {
    console.error('[Vercel Serverless] Error in /api/chat:', err);
    return res.status(500).json({
      error: 'Internal server error while executing agent',
      details: err?.message || String(err)
    });
  }
}
