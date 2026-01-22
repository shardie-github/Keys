import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('stripe_webhook_events migration', () => {
  it('allows processing status in the check constraint', () => {
    const migrationPath = join(
      process.cwd(),
      'supabase',
      'migrations',
      '020_allow_processing_stripe_webhook_events.sql'
    );
    const sql = readFileSync(migrationPath, 'utf-8');

    expect(sql).toMatch(/stripe_webhook_events_status_check/);
    expect(sql).toMatch(/processing/);
  });
});
