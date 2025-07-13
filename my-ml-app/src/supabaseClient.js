import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bdzgduzwrvlgszmkbywu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkemdkdXp3cnZsZ3N6bWtieXd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NDI4ODQsImV4cCI6MjA2NjUxODg4NH0.yTKMr_mX7MikVyLFRfb7d7NYoFkc8icxiTaiAys7nQQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
 