import { getApiKeys } from '../src/lib/chatEngine.ts';

// Vercel Serverless Function Handler for /api/status
export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { xaiKey, geminiKey, xaiModel } = getApiKeys();

  return res.status(200).json({
    status: 'online',
    platform: 'OpenBots',
    environment: 'vercel-serverless',
    xaiModel,
    hasXaiKey: !!xaiKey,
    hasGeminiKey: !!geminiKey,
  });
}
