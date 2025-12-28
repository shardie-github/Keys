# Background Event Loop Service - Implementation Summary

## Overview

The background event loop service has been fully implemented to monitor Shopify webhooks and Supabase events, generating proactive suggestions for users based on their events.

## Components Created

### 1. Integration Adapters

#### `backend/src/integrations/shopifyAdapter.ts`
- **ShopifyAdapter class** with methods:
  - `verifyWebhookSignature()` - Verifies HMAC-SHA256 signatures
  - `parseWebhook()` - Parses and validates webhook payloads
  - `fetchProduct()` - Fetches product details from Shopify API
  - `checkInventoryLevels()` - Checks if inventory is low
  - `getRecentProducts()` - Polls for recent products (fallback)
  - `topicToEventType()` - Maps Shopify topics to internal event types

#### `backend/src/integrations/supabaseAdapter.ts`
- **SupabaseAdapter class** with methods:
  - `detectSchemaChanges()` - Monitors schema changes by comparing snapshots
  - `getCurrentSchema()` - Retrieves current database schema
  - `checkPendingMigrations()` - Checks for pending migrations
  - `schemaChangeToEventType()` - Converts schema changes to event types

### 2. Background Event Loop Service

#### `backend/src/services/backgroundEventLoop.ts`
- **BackgroundEventLoop class** with:
  - `start(userId)` - Starts event loop for a user
  - `stop(userId)` - Stops event loop for a user
  - `startForAllUsers()` - Starts loops for all active users
  - `pollShopifyEvents()` - Polls Shopify for new events
  - `pollSupabaseEvents()` - Polls Supabase for schema changes
  - Supports multiple concurrent user loops

### 3. Event Processor

#### `backend/src/services/eventProcessor.ts`
- **processBackgroundEvent()** - Main processing function
- Determines if events warrant suggestions
- Generates proactive suggestions using prompt assembly
- Logs agent runs and updates events
- Handles notifications

### 4. Webhook Routes

#### `backend/src/routes/webhooks.ts`
- **POST /webhooks/shopify** - Receives Shopify webhooks
  - Verifies HMAC signature
  - Maps topics to event types
  - Stores events and triggers processing
  
- **POST /webhooks/supabase** - Receives Supabase webhooks
  - Processes database change events
  - Extracts user context
  - Stores and processes events

## Event Flow

```
1. External Event Occurs
   ├─ Shopify: Product created, order placed, inventory low
   └─ Supabase: Schema changed, table created, column added

2. Event Received
   ├─ Via Webhook (real-time)
   └─ Via Polling (fallback, every 60 seconds)

3. Event Stored
   └─ Saved to background_events table

4. Decision: Should Generate Suggestion?
   ├─ Check user's auto_suggest preference
   └─ Check if event type warrants suggestion

5. Generate Suggestion (if warranted)
   ├─ Assemble prompt using user profile + vibe config
   ├─ Orchestrate agent to generate content
   ├─ Log agent run
   └─ Update event with suggestion_id

6. Notify User
   └─ (Future: WebSocket, email, Slack, UI toast)
```

## Supported Event Types

### Shopify Events
- `shopify.product.created` → Generate TikTok hook, marketing copy
- `shopify.product.updated` → Suggest updated marketing content
- `shopify.collection.created` → Generate collection marketing
- `shopify.inventory.low` → Suggest restocking strategies
- `shopify.order.created` → Suggest follow-up marketing

### Supabase Events
- `supabase.schema.changed` → Generate documentation
- `supabase.table.created` → Document new table
- `supabase.column.added` → Document schema changes
- `supabase.migration.pending` → Alert about pending migrations

## Configuration

### Environment Variables Required
```env
SHOPIFY_API_KEY=your_api_key
SHOPIFY_API_SECRET=your_api_secret
SHOPIFY_STORE_URL=your-store.myshopify.com
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Shopify Webhook Setup
1. Go to Shopify Admin → Settings → Notifications → Webhooks
2. Create webhook: `POST https://your-domain.com/webhooks/shopify`
3. Subscribe to events:
   - `products/create`
   - `products/update`
   - `collections/create`
   - `orders/create`
   - `inventory_levels/update`

### Starting the Service

```typescript
import { backgroundEventLoop } from './services/backgroundEventLoop';

// Start for specific user
await backgroundEventLoop.start('user-id');

// Start for all users
await backgroundEventLoop.startForAllUsers();
```

## Database Schema

Events are stored in `background_events` table:
- `id` - UUID
- `user_id` - User identifier
- `event_type` - Type of event (e.g., "shopify.product.created")
- `source` - Source system ("shopify", "supabase", etc.)
- `event_data` - Full event payload (JSONB)
- `event_timestamp` - When event occurred
- `suggestion_generated` - Boolean flag
- `suggestion_id` - Reference to agent_runs table
- `user_actioned` - Whether user acted on suggestion

## Future Enhancements

1. **Real-time Notifications**
   - WebSocket/SSE for UI updates
   - Email notifications
   - Slack integration
   - Push notifications

2. **Advanced Filtering**
   - User-defined event filters
   - Event importance scoring
   - Rate limiting per event type

3. **Calendar Integration**
   - Monitor calendar events
   - Product launch date reminders
   - Meeting-based suggestions

4. **Performance Optimization**
   - Event batching
   - Parallel processing
   - Caching strategies

5. **Monitoring & Analytics**
   - Event processing metrics
   - Suggestion acceptance rates
   - Error tracking and alerting
