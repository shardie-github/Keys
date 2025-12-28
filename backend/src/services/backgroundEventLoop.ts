import { createClient } from '@supabase/supabase-js';
import { shopifyAdapter } from '../integrations/shopifyAdapter.js';
import { supabaseAdapter } from '../integrations/supabaseAdapter.js';
import { processBackgroundEvent } from './eventProcessor.js';

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
  private activeLoops: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Start background event loop for a specific user
   */
  async start(userId: string) {
    if (this.activeLoops.has(userId)) {
      console.log(`Background event loop already running for user: ${userId}`);
      return;
    }

    console.log(`Starting background event loop for user: ${userId}`);

    const loop = async () => {
      try {
        await this.processEvents(userId);
      } catch (error) {
        console.error(`Background event loop error for user ${userId}:`, error);
      }
    };

    // Run immediately
    loop();

    // Then run on interval
    const intervalId = setInterval(loop, this.pollInterval);
    this.activeLoops.set(userId, intervalId);
  }

  /**
   * Stop background event loop for a specific user
   */
  stop(userId: string) {
    const intervalId = this.activeLoops.get(userId);
    if (intervalId) {
      clearInterval(intervalId);
      this.activeLoops.delete(userId);
      console.log(`Background event loop stopped for user: ${userId}`);
    }
  }

  /**
   * Stop all background event loops
   */
  stopAll() {
    for (const [userId, intervalId] of this.activeLoops) {
      clearInterval(intervalId);
      console.log(`Stopped background event loop for user: ${userId}`);
    }
    this.activeLoops.clear();
    this.isRunning = false;
  }

  /**
   * Start event loops for all active users
   */
  async startForAllUsers() {
    try {
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('user_id');

      if (profiles) {
        for (const profile of profiles) {
          await this.start(profile.user_id);
        }
      }
    } catch (error) {
      console.error('Error starting event loops for all users:', error);
    }
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
        // Process event asynchronously (don't block the loop)
        processBackgroundEvent(userId, eventRecord).catch((error) => {
          console.error('Error processing background event:', error);
        });
      }
    }
  }

  private async pollExternalEvents(userId: string): Promise<ExternalEvent[]> {
    const events: ExternalEvent[] = [];

    // Poll Shopify events (fallback polling if webhooks aren't configured)
    const shopifyEvents = await this.pollShopifyEvents(userId);
    events.push(...shopifyEvents);

    // Poll Supabase schema changes
    const supabaseEvents = await this.pollSupabaseEvents(userId);
    events.push(...supabaseEvents);

    return events;
  }

  /**
   * Poll Shopify for recent events (fallback if webhooks aren't configured)
   */
  private async pollShopifyEvents(userId: string): Promise<ExternalEvent[]> {
    const events: ExternalEvent[] = [];

    try {
      // Get user's last checked timestamp from database
      const { data: lastEvent } = await supabase
        .from('background_events')
        .select('event_timestamp')
        .eq('user_id', userId)
        .eq('source', 'shopify')
        .order('event_timestamp', { ascending: false })
        .limit(1)
        .single();

      const lastChecked = lastEvent?.event_timestamp
        ? new Date(lastEvent.event_timestamp)
        : new Date(Date.now() - 24 * 60 * 60 * 1000); // Default to 24 hours ago

      // Get recent products
      const recentProducts = await shopifyAdapter.getRecentProducts(20);

      for (const product of recentProducts) {
        const productCreated = new Date(product.created_at);
        const productUpdated = new Date(product.updated_at);

        // Check if product was created recently
        if (productCreated > lastChecked) {
          events.push({
            type: 'shopify.product.created',
            source: 'shopify',
            data: {
              id: product.id,
              title: product.title,
              description: product.description,
              vendor: product.vendor,
              product_type: product.product_type,
            },
            timestamp: productCreated,
          });
        }

        // Check if product was updated recently (and not just created)
        if (productUpdated > lastChecked && productUpdated.getTime() !== productCreated.getTime()) {
          events.push({
            type: 'shopify.product.updated',
            source: 'shopify',
            data: {
              id: product.id,
              title: product.title,
              description: product.description,
            },
            timestamp: productUpdated,
          });
        }

        // Check inventory levels
        const lowInventory = await shopifyAdapter.checkInventoryLevels(product.id.toString(), 10);
        if (lowInventory) {
          events.push({
            type: 'shopify.inventory.low',
            source: 'shopify',
            data: {
              product_id: product.id,
              product_title: product.title,
            },
            timestamp: new Date(),
          });
        }
      }
    } catch (error) {
      console.error('Error polling Shopify events:', error);
    }

    return events;
  }

  /**
   * Poll Supabase for schema changes
   */
  private async pollSupabaseEvents(userId: string): Promise<ExternalEvent[]> {
    const events: ExternalEvent[] = [];

    try {
      // Detect schema changes
      const schemaChanges = await supabaseAdapter.detectSchemaChanges();

      for (const change of schemaChanges) {
        events.push({
          type: supabaseAdapter.schemaChangeToEventType(change),
          source: 'supabase',
          data: {
            change_type: change.type,
            table: change.table,
            column: change.column,
            details: change.details,
          },
          timestamp: change.timestamp,
        });
      }

      // Check for pending migrations
      const hasPendingMigrations = await supabaseAdapter.checkPendingMigrations();
      if (hasPendingMigrations) {
        events.push({
          type: 'supabase.migration.pending',
          source: 'supabase',
          data: {
            message: 'There are pending migrations to apply',
          },
          timestamp: new Date(),
        });
      }
    } catch (error) {
      console.error('Error polling Supabase events:', error);
    }

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


  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const backgroundEventLoop = new BackgroundEventLoop();
