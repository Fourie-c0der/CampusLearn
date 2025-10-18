
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const { SUPABASE_URL, SUPABASE_ANON_KEY } = window.__ENV__ || {};
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Supabase env not found. Run `npm run build:env` and ensure <script src="../env.js"> is before this file.');
}
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
