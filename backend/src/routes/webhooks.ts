import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';
import { shopifyAdapter } from '../integrations/shopifyAdapter.js';

const router = Router();
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Shopify webhook endpoint
 * POST /webhooks/shopify
 * Note: This route should use express.raw() middleware for signature verification
 */
router.post('/shopify', async (req, res) => {
  try {
    // Get raw body for signature verification
    // req.body will be a Buffer if express.raw() middleware is used
    const rawBody = req.body instanceof Buffer 
      ? req.body.toString('utf8') 
      : JSON.stringify(req.body);
    
    const headers = req.headers as Record<string, string>;
    
    // Parse body
    const bodyData = req.body instanceof Buffer 
      ? JSON.parse(rawBody) 
      : req.body;

    // Parse and verify webhook
    const webhook = shopifyAdapter.parseWebhook(bodyData, headers);

    if (!webhook) {
      return res.status(401).json({ error: 'Invalid webhook signature' });
    }

    // Convert Shopify topic to event type
    const eventType = shopifyAdapter.topicToEventType(webhook.topic);

    // Get user_id from shop domain or webhook data
    // In production, you'd have a mapping table: shop_domain -> user_id
    const userId = await getUserIdFromShop(webhook.shop);

    if (!userId) {
      console.warn(`No user found for shop: ${webhook.shop}`);
      return res.status(200).json({ received: true }); // Return 200 to acknowledge webhook
    }

    // Store event in background_events table
    const { data: eventRecord, error: saveError } = await supabase
      .from('background_events')
      .insert({
        user_id: userId,
        event_type: eventType,
        source: 'shopify',
        event_data: webhook.data,
        event_timestamp: webhook.timestamp,
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving Shopify webhook event:', saveError);
      return res.status(500).json({ error: 'Failed to save event' });
    }

    // Trigger background processing (async, don't wait)
    processWebhookEvent(userId, eventRecord).catch((error) => {
      console.error('Error processing webhook event:', error);
    });

    // Acknowledge webhook immediately
    res.status(200).json({ received: true, eventId: eventRecord.id });
  } catch (error) {
    console.error('Error processing Shopify webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Supabase webhook endpoint (for database changes via Supabase webhooks)
 * POST /webhooks/supabase
 */
router.post('/supabase', async (req, res) => {
  try {
    const { event_type, table, record, old_record } = req.body;

    // Get user_id from record or context
    // In production, you'd determine this from the record data
    const userId = extractUserIdFromRecord(record, table);

    if (!userId) {
      return res.status(200).json({ received: true });
    }

    const eventType = `supabase.${table}.${event_type}`;

    // Store event
    const { data: eventRecord, error: saveError } = await supabase
      .from('background_events')
      .insert({
        user_id: userId,
        event_type: eventType,
        source: 'supabase',
        event_data: {
          table,
          record,
          old_record,
          event_type,
        },
        event_timestamp: new Date().toISOString(),
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving Supabase webhook event:', saveError);
      return res.status(500).json({ error: 'Failed to save event' });
    }

    // Trigger background processing
    processWebhookEvent(userId, eventRecord).catch((error) => {
      console.error('Error processing webhook event:', error);
    });

    res.status(200).json({ received: true, eventId: eventRecord.id });
  } catch (error) {
    console.error('Error processing Supabase webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Helper: Get user_id from shop domain
 */
async function getUserIdFromShop(shopDomain: string): Promise<string | null> {
  // In production, you'd have a shop_users table mapping shop domains to user_ids
  // For now, return null or implement a lookup
  try {
    // Example: Check if user has shopify in their stack and use their user_id
    const { data } = await supabase
      .from('user_profiles')
      .select('user_id')
      .contains('stack', { shopify: true })
      .limit(1)
      .single();

    return data?.user_id || null;
  } catch {
    return null;
  }
}

/**
 * Helper: Extract user_id from Supabase record
 */
function extractUserIdFromRecord(record: any, table: string): string | null {
  // Try common user_id fields
  if (record?.user_id) return record.user_id;
  if (record?.userId) return record.userId;
  if (record?.owner_id) return record.owner_id;

  // For user_profiles table, use the user_id field
  if (table === 'user_profiles' && record?.user_id) {
    return record.user_id;
  }

  return null;
}

/**
 * Process webhook event asynchronously
 */
async function processWebhookEvent(userId: string, eventRecord: any) {
  try {
    // Check if suggestion should be generated
    const { data: vibeConfig } = await supabase
      .from('vibe_configs')
      .select('auto_suggest')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!vibeConfig?.auto_suggest) {
      return;
    }

    // Import here to avoid circular dependencies
    const { assemblePrompt } = await import('../services/promptAssembly.js');
    const { orchestrateAgent } = await import('../services/agentOrchestration.js');

    // Get full vibe config
    const { data: fullVibeConfig } = await supabase
      .from('vibe_configs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!fullVibeConfig) {
      return;
    }

    // Generate task description
    const taskDescription = eventToTaskDescription(eventRecord);

    // Assemble prompt
    const promptAssembly = await assemblePrompt(userId, taskDescription, fullVibeConfig);

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
        trigger_data: eventRecord.event_data,
        assembled_prompt: promptAssembly.systemPrompt,
        selected_atoms: promptAssembly.selectedAtomIds,
        vibe_config_snapshot: fullVibeConfig,
        agent_type: 'suggestion',
        model_used: output.modelUsed,
        generated_content: output.content,
        tokens_used: output.tokensUsed,
        cost_usd: output.costUsd,
      })
      .select()
      .single();

    // Update event with suggestion
    if (run) {
      await supabase
        .from('background_events')
        .update({
          suggestion_generated: true,
          suggestion_id: run.id,
        })
        .eq('id', eventRecord.id);
    }
  } catch (error) {
    console.error('Error processing webhook event:', error);
  }
}

function eventToTaskDescription(eventRecord: any): string {
  const eventType = eventRecord.event_type;

  if (eventType.startsWith('shopify.product.created')) {
    const productTitle = eventRecord.event_data?.title || 'product';
    return `A new product "${productTitle}" was created in Shopify. Generate a TikTok hook and brief for promoting this product.`;
  }

  if (eventType.startsWith('shopify.product.updated')) {
    const productTitle = eventRecord.event_data?.title || 'product';
    return `Product "${productTitle}" was updated in Shopify. Suggest updated marketing copy and promotional content.`;
  }

  if (eventType.startsWith('shopify.inventory.low')) {
    return `Product inventory is running low. Suggest restocking strategies and customer communication.`;
  }

  if (eventType.startsWith('supabase.schema')) {
    return `Database schema was changed. Generate documentation and migration notes for the changes.`;
  }

  return `Event ${eventType} occurred. Suggest next steps and actions.`;
}

export { router as webhooksRouter };
