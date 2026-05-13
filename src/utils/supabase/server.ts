import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const createClient = (cookieStore?: Awaited<ReturnType<typeof cookies>>) => {
  const store = cookieStore || cookies();
  
  if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Server Supabase keys missing!");
    return null as any;
  }

  return createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          try {
            return store.getAll()
          } catch {
            return []
          }
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => store.set(name, value, options))
          } catch {
            // Handled by middleware
          }
        },
      },
    },
  );
};
