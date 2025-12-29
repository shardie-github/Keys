/**
 * @deprecated Use createClient from @/utils/supabase/client instead
 * This file is kept for backward compatibility but will be removed
 */
import { createClient as createBrowserClient } from '@/utils/supabase/client';

export const supabase = createBrowserClient();
