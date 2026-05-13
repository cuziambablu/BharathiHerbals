import { createBrowserClient } from "@supabase/ssr";

export const createClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    // If we are in the browser, show a visible alert so the user knows why it's freezing
    if (typeof window !== 'undefined') {
      console.error("❌ SUPABASE KEYS MISSING IN VERCEL!");
      // We don't want to alert() in production usually, but for this emergency, we need visibility
    }
    return null as any;
  }

  return createBrowserClient(
    supabaseUrl,
    supabaseKey,
  );
};
