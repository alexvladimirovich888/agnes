import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini client
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!geminiClient) {
    try {
      geminiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    } catch (err) {
      console.error('[Gemini] Client initialization error:', err);
      return null;
    }
  }
  return geminiClient;
}

// Health & Status endpoint
app.get('/api/status', (req: Request, res: Response) => {
  res.json({
    status: 'online',
    platform: 'OpenBots',
    engine: 'Agnes 2.5 Pro',
    version: '2.5.0-pro',
    activeAgents: 4,
    hasXaiKey: !!(process.env.XAI_API_KEY && process.env.XAI_API_KEY !== 'YOUR_SECRET_KEY' && process.env.XAI_API_KEY.trim() !== ''),
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
  });
});

// Chat endpoint for Agents (Agnes 2.5 Pro abstraction)
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { agentId, agentName, systemPrompt, customPrompt, messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    // Build the consolidated system prompt
    let fullSystemPrompt = systemPrompt || 'You are an AI agent on the OpenBots platform powered by Agnes 2.5 Pro.';
    if (customPrompt && customPrompt.trim()) {
      fullSystemPrompt += `\n\nUSER CUSTOM SYSTEM INSTRUCTIONS:\n${customPrompt.trim()}`;
    }

    const xaiApiKey = process.env.XAI_API_KEY;
    const xaiModel = process.env.XAI_MODEL || 'grok-4.6';

    let lastError = '';

    // 1. Primary: xAI execution
    if (xaiApiKey && xaiApiKey !== 'YOUR_SECRET_KEY' && xaiApiKey.trim() !== '') {
      console.log(`[xAI] Model: ${xaiModel}`);
      console.log(`[xAI] Request started`);

      try {
        const response = await fetch('https://api.x.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${xaiApiKey}`
          },
          body: JSON.stringify({
            model: xaiModel,
            messages: [
              { role: 'system', content: fullSystemPrompt },
              ...messages.map((m: { role: string; content: string }) => ({
                role: m.role === 'agent' ? 'assistant' : m.role,
                content: m.content
              }))
            ],
            temperature: 0.7,
          })
        });

        if (!response.ok) {
          const errText = await response.text();
          const statusAndErr = `${response.status} ${errText}`;
          console.error(`[xAI] Request failed: ${statusAndErr}`);
          lastError = `xAI API failed: ${statusAndErr}`;
        } else {
          const data = await response.json();
          const reply = data.choices?.[0]?.message?.content;
          if (reply) {
            console.log(`[xAI] Request successful`);
            return res.json({
              reply,
              model: 'Agnes 2.5 Pro',
              provider: 'xai'
            });
          } else {
            console.error(`[xAI] Request failed: Empty content in response`);
            lastError = 'xAI API returned empty response';
          }
        }
      } catch (xaiErr: any) {
        const errMsg = xaiErr?.message || String(xaiErr);
        console.error(`[xAI] Request failed: ${errMsg}`);
        lastError = `xAI API error: ${errMsg}`;
      }
    } else {
      console.log(`[xAI] Model: ${xaiModel}`);
      console.log(`[xAI] Request failed: XAI_API_KEY not configured or is placeholder`);
      lastError = 'XAI_API_KEY not configured';
    }

    // 2. Fallback: Google Gemini (gemini-3.6-flash)
    console.log('[Gemini] Fallback started');
    console.log('[Gemini] Model: gemini-3.6-flash');

    const gemini = getGeminiClient();
    if (gemini) {
      try {
        const formattedHistory = messages.map((m: { role: string; content: string }) => ({
          role: m.role === 'agent' || m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content || '' }],
        }));

        let validContents = formattedHistory.filter(item => item.parts[0].text.trim().length > 0);
        if (validContents.length === 0) {
          validContents = [{ role: 'user', parts: [{ text: 'Hello' }] }];
        } else if (validContents[0].role === 'model') {
          validContents = [{ role: 'user', parts: [{ text: 'Hello' }] }, ...validContents];
        }

        const result = await gemini.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: validContents,
          config: {
            systemInstruction: fullSystemPrompt,
            temperature: 0.7,
          },
        });

        const reply = result.text || 'No response returned by agent.';
        console.log('[Gemini] Request successful');
        return res.json({
          reply,
          model: 'Agnes 2.5 Pro',
          provider: 'genai'
        });
      } catch (geminiErr: any) {
        const errMsg = geminiErr?.message || String(geminiErr);
        console.error(`[Gemini] Request failed: ${errMsg}`);
        lastError = `Gemini fallback failed: ${errMsg}`;
      }
    } else {
      console.error('[Gemini] Request failed: GEMINI_API_KEY not available');
      lastError = 'GEMINI_API_KEY is not configured';
    }

    // If both providers failed
    return res.status(502).json({
      error: `API Execution failed. ${lastError}`
    });

  } catch (err: any) {
    console.error('Unhandled server error in /api/chat:', err);
    return res.status(500).json({
      error: 'Internal server error while processing agent request.'
    });
  }
});

// Start Express Server with Vite middleware
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NEXUS Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

