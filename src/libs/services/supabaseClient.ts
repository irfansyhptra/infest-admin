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

// TANPA prefix NEXT_PUBLIC_. Prefix itu menyuruh Next.js menyulih nilainya ke
// dalam bundle browser saat build, dan key ini melewati seluruh RLS.
// Sebelumnya namanya memang berprefix NEXT_PUBLIC_. Nilainya kebetulan belum
// ikut terbundel karena tidak ada kode klien yang memanggil getSupabaseAdmin(),
// sehingga webpack membuangnya — tapi itu bergantung pada tree-shaking, bukan
// pada aturan. Satu import dari komponen klien saja sudah cukup untuk
// membocorkannya. Nama tanpa prefix + guard di bawah membuatnya mustahil.
const getSupabaseServiceRoleKey = () => {
  if (typeof window !== 'undefined') {
    throw new Error('Service role key tidak boleh dipakai di browser')
  }
  return process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!
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
  if (typeof window !== 'undefined') {
    throw new Error('Admin client tidak boleh dipakai di browser')
  }

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
