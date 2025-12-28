# Database Schema Summary

## Overview

Complete backend schema with 13 tables, optimized indexes, RLS policies, and helper functions.

## Tables Created

### Core Tables (6)
1. **user_profiles** - User profiles, preferences, embeddings
2. **prompt_atoms** - Reusable prompt components
3. **vibe_configs** - User vibe configurations
4. **agent_runs** - Agent execution logs
5. **background_events** - Integration events
6. **notifications** - User notifications

### Template System Tables (7)
7. **user_template_customizations** - User template settings
8. **template_customization_history** - Change history
9. **template_usage_analytics** - Usage metrics
10. **template_feedback** - User ratings
11. **shared_template_customizations** - Shared templates
12. **template_presets** - Template presets
13. **template_versions** - Version history

## Key Features

### Row Level Security (RLS)
- ✅ Enabled on all tables
- ✅ Users can only access their own data
- ✅ Service role has full access
- ✅ Public read access where appropriate

### Indexes
- ✅ Primary keys on all tables
- ✅ Foreign key indexes
- ✅ GIN indexes for JSONB fields
- ✅ GIN indexes for array fields
- ✅ Partial indexes for common queries
- ✅ IVFFlat index for vector similarity search

### Functions
- ✅ `update_updated_at_column()` - Auto-update timestamps
- ✅ `track_template_usage()` - Track template metrics
- ✅ `create_customization_history()` - Auto-create history
- ✅ `auth_user_id()` - Extract user ID from JWT/auth

### Triggers
- ✅ Auto-update `updated_at` on 6 tables
- ✅ Auto-create history entries on template changes

## Quick Stats

- **Tables**: 13
- **Indexes**: 50+
- **RLS Policies**: 40+
- **Functions**: 4
- **Triggers**: 7

## Usage

1. Copy `complete_schema_with_rls.sql` to Supabase SQL Editor
2. Run the script
3. Verify tables in Table Editor
4. Test RLS policies

See `README_SCHEMA_SETUP.md` for detailed instructions.
