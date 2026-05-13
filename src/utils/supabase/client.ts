import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log("Supabase URL:", supabaseUrl);
console.log("Supabase Key defined:", !!supabaseKey);

export const createClient = () => {
  if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Supabase environment variables are missing! Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY/ANON_KEY");
    return null as any;
  }
  return createBrowserClient(
    supabaseUrl,
    supabaseKey,
  );
};
