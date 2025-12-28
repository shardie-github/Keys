import { createClient } from '@supabase/supabase-js';
import { assemblePrompt } from './promptAssembly.js';
import { orchestrateAgent } from './agentOrchestration.js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface ExternalEvent {
  type: string;
  source: 'shopify' | 'supabase' | 'calendar' | 'manual';
  data: Record<string, any>;
  timestamp: Date;
}

export class BackgroundEventLoop {
  private isRunning = false;
  private pollInterval = 60000; // 1 minute

  async start(userId: string) {
    if (this.isRunning) {
      console.log('Background event loop already running');
      return;
    }

    this.isRunning = true;
    console.log(`Starting background event loop for user: ${userId}`);

    while (this.isRunning) {
      try {
        await this.processEvents(userId);
        await this.sleep(this.pollInterval);
      } catch (error) {
        console.error('Background event loop error:', error);
        await this.sleep(300000); // Wait 5 minutes on error
      }
    }
  }

  stop() {
    this.isRunning = false;
    console.log('Background event loop stopped');
  }

  private async processEvents(userId: string) {
    // Poll external sources for events
    const events = await this.pollExternalEvents(userId);

    for (const event of events) {
      // Store event in background_events table
      const { data: eventRecord, error: saveError } = await supabase
        .from('background_events')
        .insert({
          user_id: userId,
          event_type: event.type,
          source: event.source,
          event_data: event.data,
          event_timestamp: event.timestamp.toISOString(),
        })
        .select()
        .single();

      if (saveError) {
        console.error('Error saving background event:', saveError);
        continue;
      }

      // Determine if suggestion warranted
      const shouldSuggest = await this.shouldGenerateSuggestion(event, userId);

      if (shouldSuggest && eventRecord) {
        // Generate proactive suggestion
        const suggestion = await this.generateProactiveSuggestion(event, userId);

        if (suggestion) {
          // Update event with suggestion
          await supabase
            .from('background_events')
            .update({
              suggestion_generated: true,
              suggestion_id: suggestion.id,
            })
            .eq('id', eventRecord.id);

          // Notify user (would integrate with notification service)
          await this.notifyUserOfSuggestion(userId, suggestion);
        }
      }
    }
  }

  private async pollExternalEvents(userId: string): Promise<ExternalEvent[]> {
    const events: ExternalEvent[] = [];

    // TODO: Implement actual polling for Shopify, Supabase, Calendar
    // For now, return empty array

    // Example: Poll Shopify webhooks
    // const shopifyEvents = await this.pollShopifyEvents(userId);
    // events.push(...shopifyEvents);

    return events;
  }

  private async shouldGenerateSuggestion(
    event: ExternalEvent,
    userId: string
  ): Promise<boolean> {
    // Determine if this event warrants a suggestion
    // Example: product.created -> suggest TikTok hook
    if (event.type === 'shopify.product.created') {
      return true;
    }

    if (event.type === 'supabase.schema.changed') {
      return true;
    }

    // Check user preferences
    const { data: vibeConfig } = await supabase
      .from('vibe_configs')
      .select('auto_suggest')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    return vibeConfig?.auto_suggest ?? true;
  }

  private async generateProactiveSuggestion(
    event: ExternalEvent,
    userId: string
  ): Promise<any> {
    try {
      // Get user's vibe config
      const { data: vibeConfig } = await supabase
        .from('vibe_configs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!vibeConfig) {
        return null;
      }

      // Generate task description based on event
      const taskDescription = this.eventToTaskDescription(event);

      // Assemble prompt
      const promptAssembly = await assemblePrompt(
        userId,
        taskDescription,
        vibeConfig
      );

      // Orchestrate agent
      const output = await orchestrateAgent(
        promptAssembly,
        taskDescription,
        taskDescription
      );

      // Log agent run
      const { data: run } = await supabase
        .from('agent_runs')
        .insert({
          user_id: userId,
          trigger: 'event',
          trigger_data: event.data,
          assembled_prompt: promptAssembly.systemPrompt,
          selected_atoms: promptAssembly.selectedAtomIds,
          vibe_config_snapshot: vibeConfig,
          agent_type: 'suggestion',
          model_used: output.modelUsed,
          generated_content: output.content,
          tokens_used: output.tokensUsed,
          cost_usd: output.costUsd,
        })
        .select()
        .single();

      return run;
    } catch (error) {
      console.error('Error generating proactive suggestion:', error);
      return null;
    }
  }

  private eventToTaskDescription(event: ExternalEvent): string {
    switch (event.type) {
      case 'shopify.product.created':
        return `A new product "${event.data.title || 'product'}" was created. Generate a TikTok hook and brief for promoting this product.`;

      case 'shopify.product.updated':
        return `Product "${event.data.title || 'product'}" was updated. Suggest updated marketing copy.`;

      case 'supabase.schema.changed':
        return `Database schema was changed. Generate documentation and migration notes.`;

      default:
        return `Event ${event.type} occurred. Suggest next steps.`;
    }
  }

  private async notifyUserOfSuggestion(userId: string, suggestion: any) {
    // TODO: Integrate with notification service (Slack, email, UI toast)
    console.log(`Notification for user ${userId}:`, suggestion.id);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const backgroundEventLoop = new BackgroundEventLoop();
