import { GoogleGenAI } from '@google/genai';

export interface ChatMessagePayload {
  role: string;
  content: string;
}

export interface ChatRequestPayload {
  agentId?: string;
  agentName?: string;
  systemPrompt?: string;
  customPrompt?: string;
  messages: ChatMessagePayload[];
}

export interface ChatResponsePayload {
  reply?: string;
  model?: string;
  provider?: string;
  error?: string;
  details?: string;
}

// Helper to get sanitized API keys from any supported environment variable
export function getApiKeys() {
  const rawXai = process.env.XAI_API_KEY || process.env.GROK_API_KEY || '';
  const xaiKey = rawXai.trim() !== '' && rawXai !== 'YOUR_SECRET_KEY' && rawXai !== 'MY_XAI_KEY' ? rawXai.trim() : null;

  const rawGemini = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.API_KEY || '';
  const geminiKey = rawGemini.trim() !== '' && rawGemini !== 'MY_GEMINI_API_KEY' ? rawGemini.trim() : null;

  const rawModel = (process.env.XAI_MODEL || '').trim();
  // Valid xAI models: grok-2-latest, grok-2, grok-beta, grok-2-vision-1212
  // If user or default had fictional grok-4.5/4.6, map to real grok-2-latest
  let xaiModel = 'grok-2-latest';
  if (rawModel && !rawModel.startsWith('grok-4')) {
    xaiModel = rawModel;
  }

  return { xaiKey, geminiKey, xaiModel };
}

// xAI Grok API Caller with intelligent fallback across valid models
async function callXai(
  xaiKey: string,
  preferredModel: string,
  fullSystemPrompt: string,
  messages: ChatMessagePayload[]
): Promise<{ reply: string; model: string }> {
  // Ordered list of models to try
  const modelsToTry = [
    preferredModel,
    'grok-2-latest',
    'grok-2',
    'grok-beta',
    'grok-2-1212'
  ].filter((v, i, a) => a.indexOf(v) === i); // Deduplicate

  let lastStatus = 0;
  let lastErrorText = '';

  for (const model of modelsToTry) {
    try {
      console.log(`[xAI] Attempting call with model: ${model}`);
      const response = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${xaiKey}`
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: fullSystemPrompt },
            ...messages.map((m) => ({
              role: m.role === 'agent' || m.role === 'assistant' ? 'assistant' : 'user',
              content: m.content
            }))
          ],
          temperature: 0.7
        })
      });

      if (response.ok) {
        const data = await response.json();
        const reply = data.choices?.[0]?.message?.content;
        if (reply && typeof reply === 'string') {
          return { reply: reply.trim(), model: `xAI ${model}` };
        }
      } else {
        lastStatus = response.status;
        lastErrorText = await response.text();
        console.warn(`[xAI] Model ${model} failed (${response.status}): ${lastErrorText}`);
        
        // If it's an authentication error, trying other models won't help
        if (response.status === 401 || response.status === 403) {
          throw new Error(`xAI Authentication Error (${response.status}): Check your XAI_API_KEY.`);
        }
      }
    } catch (err: any) {
      if (err.message?.includes('Authentication Error')) {
        throw err;
      }
      lastErrorText = err?.message || String(err);
      console.warn(`[xAI] Network error for model ${model}:`, err);
    }
  }

  throw new Error(`xAI API returned status ${lastStatus || 500}: ${lastErrorText || 'Failed to get response'}`);
}

// Google Gemini API Caller
async function callGemini(
  geminiKey: string,
  fullSystemPrompt: string,
  messages: ChatMessagePayload[]
): Promise<{ reply: string; model: string }> {
  try {
    const ai = new GoogleGenAI({
      apiKey: geminiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });

    const formattedHistory = messages.map((m) => ({
      role: m.role === 'agent' || m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content || '' }]
    }));

    let validContents = formattedHistory.filter(item => item.parts[0].text.trim().length > 0);
    if (validContents.length === 0) {
      validContents = [{ role: 'user', parts: [{ text: 'Hello' }] }];
    } else if (validContents[0].role === 'model') {
      validContents = [{ role: 'user', parts: [{ text: 'Hello' }] }, ...validContents];
    }

    const result = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: validContents,
      config: {
        systemInstruction: fullSystemPrompt,
        temperature: 0.7
      }
    });

    const reply = result.text || 'No response returned by agent.';
    return { reply, model: 'Gemini 3.7 Flash' };
  } catch (err: any) {
    console.error('[Gemini] Execution error:', err);
    throw new Error(`Gemini API error: ${err.message || String(err)}`);
  }
}

// Core execution handler used by both Express server and Vercel Serverless Functions
export async function processChat(payload: ChatRequestPayload): Promise<ChatResponsePayload> {
  const { systemPrompt, customPrompt, messages } = payload;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return { error: 'Messages array is required' };
  }

  let fullSystemPrompt = systemPrompt || 'You are an AI agent on the OpenBots platform.';
  if (customPrompt && customPrompt.trim()) {
    fullSystemPrompt += `\n\nUSER CUSTOM SYSTEM INSTRUCTIONS:\n${customPrompt.trim()}`;
  }

  const { xaiKey, geminiKey, xaiModel } = getApiKeys();
  let xaiError = '';
  let geminiError = '';

  // 1. Try xAI Grok if key is available
  if (xaiKey) {
    try {
      const res = await callXai(xaiKey, xaiModel, fullSystemPrompt, messages);
      return {
        reply: res.reply,
        model: res.model,
        provider: 'xai'
      };
    } catch (err: any) {
      xaiError = err.message || String(err);
      console.error('[xAI Grok Failure]', xaiError);
    }
  } else {
    xaiError = 'XAI_API_KEY is not configured in environment variables.';
  }

  // 2. Fallback to Gemini if key is available
  if (geminiKey) {
    try {
      const res = await callGemini(geminiKey, fullSystemPrompt, messages);
      return {
        reply: res.reply,
        model: res.model,
        provider: 'gemini'
      };
    } catch (err: any) {
      geminiError = err.message || String(err);
      console.error('[Gemini Fallback Failure]', geminiError);
    }
  } else {
    geminiError = 'GEMINI_API_KEY is not configured in environment variables.';
  }

  // If both failed or are not configured, provide an actionable error message for Vercel / GitHub deployment
  return {
    error: `API key error on server. ${xaiError} ${geminiError}`,
    details: 'Please add XAI_API_KEY (or GROK_API_KEY or GEMINI_API_KEY) to your Vercel Project Settings -> Environment Variables.'
  };
}
