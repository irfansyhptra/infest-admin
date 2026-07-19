import { createClient } from '@supabase/supabase-js'
import { Database } from '../../types/database'

// Get environment variables for both browser and Node.js
const getSupabaseUrl = () => {
  // In browser, use NEXT_PUBLIC_ prefixed variables
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_SUPABASE_URL!
  }
  // In Node.js (server/scripts), use regular variables
  return process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!
}

const getSupabaseAnonKey = () => {
  // In browser, use NEXT_PUBLIC_ prefixed variables
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  }
  // In Node.js (server/scripts), use regular variables
  return process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
}

const getSupabaseServiceRoleKey = () => {
//   // Service role key should only be used server-side
//   if (typeof window !== 'undefined') {
//     throw new Error('Service role key should not be used in the browser')
//   }
  return process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!
}

const supabaseUrl = getSupabaseUrl()
const supabaseAnonKey = getSupabaseAnonKey()

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Regular client for browser and server-side operations
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Admin client with service role key (server-side only)
// Only create on server-side
export const getSupabaseAdmin = () => {
//   if (typeof window !== 'undefined') {
//     throw new Error('Admin client should not be used in the browser')
//   }
  
  return createClient<Database>(
    supabaseUrl,
    getSupabaseServiceRoleKey(),
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

export default supabase
