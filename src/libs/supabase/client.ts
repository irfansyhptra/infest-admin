import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Mock client to prevent runtime evaluation crashes if environment variables are missing on Vercel
const createMockSupabase = () => {
  const dummyPromise = () => new Promise((resolve) => resolve({ data: null, error: new Error("Supabase client is not initialized due to missing environment variables.") }));
  const dummyAuth = {
    getSession: async () => ({ data: { session: null }, error: null }),
    getUser: async () => ({ data: { user: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithPassword: async () => ({ data: { user: null, session: null }, error: new Error("Supabase is not configured.") }),
    signOut: async () => ({ error: null }),
  };
  return {
    auth: dummyAuth,
    from: () => ({
      select: () => ({
        eq: () => ({
          single: dummyPromise,
          order: dummyPromise,
        }),
        order: dummyPromise,
      }),
    }),
  } as any;
};

export const supabase: SupabaseClient = (supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createMockSupabase()) as any;

export default supabase;
