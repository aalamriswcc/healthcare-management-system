import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.REACT_APP_SUPABASE_URL || 'https://owzdojjwuqmabenlmswg.supabase.co'
const supabaseAnonKey = import.meta.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93emRvamp3dXFtYWJlbmxtc3dnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1MTY1MjcsImV4cCI6MjA3NDA5MjUyN30.XDsr9Ll9XOemTpAhPggbv0D77HNjBUFVHnHFKZb1mts'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

