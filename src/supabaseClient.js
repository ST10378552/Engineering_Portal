import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rwsnmapjsqdhzqdjnsty.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3c25tYXBqc3FkaHpxZGpuc3R5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5MDMxNTAsImV4cCI6MjA4NDQ3OTE1MH0.d97VWi2hktdEau92dvsdaQmStKu4sh1MFjFS3qZXsy8'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)