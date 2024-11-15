import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = 'https://xkznwtejeerrobgpnfzv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhrem53dGVqZWVycm9iZ3BuZnp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE2OTk4MTYsImV4cCI6MjA0NzI3NTgxNn0.fWNH2v2dh4pW1CB4EduzoNrzGuHTBri_j9w8_mgtg90';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: localStorage
  }
});