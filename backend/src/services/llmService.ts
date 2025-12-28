import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface LLMRequest {
  systemPrompt: string;
  userPrompt: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface LLMResponse {
  content: string;
  model: string;
  tokensUsed: number;
  costUsd: number;
}

export class LLMService {
  async generate(request: LLMRequest): Promise<LLMResponse> {
    const model = request.model || 'gpt-4-turbo-preview';

    if (model.startsWith('gpt-') || model.startsWith('o1-')) {
      return this.generateOpenAI(request, model);
    } else if (model.startsWith('claude-')) {
      return this.generateAnthropic(request, model);
    } else {
      throw new Error(`Unsupported model: ${model}`);
    }
  }

  private async generateOpenAI(
    request: LLMRequest,
    model: string
  ): Promise<LLMResponse> {
    const response = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: request.systemPrompt },
        { role: 'user', content: request.userPrompt },
      ],
      temperature: request.temperature || 0.7,
      max_tokens: request.maxTokens || 2000,
    });

    const content = response.choices[0]?.message?.content || '';
    const tokensUsed =
      (response.usage?.prompt_tokens || 0) + (response.usage?.completion_tokens || 0);

    // Rough cost calculation (adjust based on actual pricing)
    const costUsd = this.calculateOpenAICost(model, tokensUsed);

    return {
      content,
      model,
      tokensUsed,
      costUsd,
    };
  }

  private async generateAnthropic(
    request: LLMRequest,
    model: string
  ): Promise<LLMResponse> {
    const response = await anthropic.messages.create({
      model: model as any,
      max_tokens: request.maxTokens || 2000,
      temperature: request.temperature || 0.7,
      system: request.systemPrompt,
      messages: [
        {
          role: 'user',
          content: request.userPrompt,
        },
      ],
    });

    const content = response.content[0]?.type === 'text' ? response.content[0].text : '';
    const tokensUsed = response.usage.input_tokens + response.usage.output_tokens;

    // Rough cost calculation
    const costUsd = this.calculateAnthropicCost(model, tokensUsed);

    return {
      content,
      model,
      tokensUsed,
      costUsd,
    };
  }

  private calculateOpenAICost(model: string, tokens: number): number {
    // Rough estimates (adjust based on actual pricing)
    const costPer1kTokens: Record<string, number> = {
      'gpt-4-turbo-preview': 0.01,
      'gpt-4': 0.03,
      'gpt-3.5-turbo': 0.002,
    };

    const costPer1k = costPer1kTokens[model] || 0.01;
    return (tokens / 1000) * costPer1k;
  }

  private calculateAnthropicCost(model: string, tokens: number): number {
    // Rough estimates
    const costPer1kTokens: Record<string, number> = {
      'claude-3-opus': 0.015,
      'claude-3-sonnet': 0.003,
      'claude-3-haiku': 0.00025,
    };

    const costPer1k = costPer1kTokens[model] || 0.003;
    return (tokens / 1000) * costPer1k;
  }
}

export const llmService = new LLMService();
