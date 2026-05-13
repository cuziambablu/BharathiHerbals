import { createClient } from '@/utils/supabase/client'

export const getSupabase = () => {
  if (typeof window === 'undefined') return null;
  return createClient();
};

export const supabase = typeof window !== 'undefined' ? createClient() : null;

