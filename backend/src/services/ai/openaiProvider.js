/**
 * OpenAI AI Provider for Ask Mitra
 * Connects to OpenAI Chat Completions API when AI_PROVIDER=openai
 */
import { RuleBasedAIProvider } from './provider.js';
import { buildGeminiPrompt } from './systemPrompt.js';

export class OpenAIAIProvider extends RuleBasedAIProvider {
  constructor(apiKey) {
    super();
    if (!apiKey || !apiKey.trim()) {
      throw new Error('OPENAI_API_KEY is missing or empty.');
    }
    this.apiKey = apiKey.trim();
    this.modelName = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  }

  async generateResponse(params) {
    const { message, intent, context = {}, projectData = null, routeData = null } = params;
    const prompt = buildGeminiPrompt({ message, context, projectData, routeData });

    const payload = {
      model: this.modelName,
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: message }
      ],
      temperature: 0.3,
      max_tokens: 1000
    };

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      const errMsg = errJson?.error?.message || `OpenAI API returned status ${response.status}`;
      throw new Error(`OpenAI request failed: ${errMsg}`);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content?.trim();

    if (!reply) {
      throw new Error('OpenAI returned an empty response.');
    }

    return reply;
  }
}

export default OpenAIAIProvider;
