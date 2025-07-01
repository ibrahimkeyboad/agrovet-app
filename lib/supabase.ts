import { createClient } from '@supabase/supabase-js';

const supabaseUrl ="https://xeubklnzrysyxolndwzf.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhldWJrbG56cnlzeXhvbG5kd3pmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMDk5MDUsImV4cCI6MjA2Njc4NTkwNX0.IYD2PjC3bEeEOKmS0zXXPDWEfzd0-t5TOmzBG8NP2XA"

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});