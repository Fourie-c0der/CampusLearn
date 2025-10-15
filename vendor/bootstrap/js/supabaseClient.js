// supabaseClient.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Supabase project credentials
const SUPABASE_URL = 'https://peexuuzunrhbimpemdwz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlZXh1dXp1bnJoYmltcGVtZHd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxMzk3MjYsImV4cCI6MjA3NTcxNTcyNn0.sOOZfxsQvBF35vijxgO3K5nedKww0fyWKBXiebyfAB0';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
