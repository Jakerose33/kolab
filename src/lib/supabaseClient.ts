// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://vjdcstouchofifbdanjx.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqZGNzdG91Y2hvZmlmYmRhbmp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyMzY1NTcsImV4cCI6MjA3MDgxMjU1N30.HvT_EZDdW428jkVOlrAE-XZ_V4W1AEj8eEbSsgF4BoQ"

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,          // keep after refresh
    autoRefreshToken: true,        // refresh before expiry
    detectSessionInUrl: true,      // handles OAuth/magic link redirect
  },
})