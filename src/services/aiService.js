// ---------------------------------------------------------------------------
// aiService.js — DRACO AI powered by NVIDIA (DeepSeek via OpenAI-compat API)
// ---------------------------------------------------------------------------

const NVIDIA_API_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';
const NVIDIA_API_KEY = import.meta.env.VITE_NVIDIA_API_KEY;
const NVIDIA_MODEL   = import.meta.env.VITE_NVIDIA_MODEL || 'nvidia/llama-3.1-nemotron-70b-instruct';

// ---------------------------------------------------------------------------
// Build system prompt dynamically based on context
// ---------------------------------------------------------------------------
export function buildSystemPrompt({ currentPage, userRole, userName }) {
  const roleContextMap = {
    manager:        'a Manager — you can create/edit projects, manage all team members, set SLA, and assign tasks.',
    chef_de_projet: 'a Chef de Projet — you supervise projects assigned to you, manage tasks and developers on your projects.',
    developer:      'a Developer — you can view projects and tasks assigned to you, and validate your task completion.',
  };

  const roleContext = roleContextMap[userRole]  || 'a user';

  return `You are DRACO, an intelligent AI assistant in PT Front.
Current context: User: ${userName || 'the user'}, Role: ${roleContext}, Current page: ${currentPage}.

Your capabilities:
- Help navigate the app.
- PERFORM ACTIONS by appending tags:
  * Theme Noir: [ACTION:THEME:noir]
  * Theme Light: [ACTION:THEME:cloud]
  * Create Project: [ACTION:NAV:PROJECT_CREATE]
- Explain features and workflow.
- Speak concisely.

Example: "I'll switch the theme to Noir for you. [ACTION:THEME:noir]"
Example: "Opening the project creation page. [ACTION:NAV:PROJECT_CREATE]"

Keep answers under 3 sentences. Do NOT use <think> tags.`;
}

// ---------------------------------------------------------------------------
// Stream a response from NVIDIA API
// ---------------------------------------------------------------------------
export async function sendMessageToNvidia({ messages, systemPrompt, onChunk }) {
  if (!NVIDIA_API_KEY) {
    throw new Error('NVIDIA API key not configured. Add VITE_NVIDIA_API_KEY to your .env file.');
  }

  const body = {
    model: NVIDIA_MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages.map(m => ({
        role:    m.role === 'assistant' ? 'assistant' : 'user',
        content: m.text,
      })),
    ],
    temperature: 0.7,
    top_p: 0.95,
    max_tokens: 512,
    stream: true,
  };

  try {
    const response = await fetch(NVIDIA_API_URL, {
      method:  'POST',
      headers: {
        'Authorization': `Bearer ${NVIDIA_API_KEY}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('NVIDIA HTTP Error:', response.status, errText);
      throw new Error(`NVIDIA API error ${response.status}: ${errText}`);
    }

    const reader  = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let fullText  = '';
    let buffer    = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop();

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data:')) continue;

        const data = trimmed.slice(5).trim();
        if (data === '[DONE]') break;

        try {
          const parsed = JSON.parse(data);
          let token = parsed.choices?.[0]?.delta?.content || '';
          if (token) {
            fullText += token;
            if (typeof onChunk === 'function') {
              const clean = fullText.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
              onChunk(clean);
            }
          }
        } catch (innerErr) {
          console.error('JSON Parse Error:', innerErr);
        }
      }
    }

    return fullText.replace(/<think>[\s\S]*?<\/think>/gi, '').trim()
      || 'I had trouble processing that. Please try again.';

  } catch (err) {
    console.error('NVIDIA Service Error:', err);
    throw err;
  }
}

export const sendMessageToGroq = sendMessageToNvidia;
