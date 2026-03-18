import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.replace(/['"\s]/g, '').trim()
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.replace(/['"\s]/g, '').trim()

console.log('Supabase URL being used:', supabaseUrl);

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'undefined') {
  console.error('CRITICAL: Supabase configuration is invalid or missing!');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
