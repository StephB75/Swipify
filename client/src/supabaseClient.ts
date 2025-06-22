import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://otbtfoyfadgfyrdmbxhv.supabase.co/'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90YnRmb3lmYWRnZnlyZG1ieGh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1MzkxNTksImV4cCI6MjA2NjExNTE1OX0.c2Ini5LXxPhEWR50KRcf5hQKB_dj43Pck4ImKHUfc84'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
