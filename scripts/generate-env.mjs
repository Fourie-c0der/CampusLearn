
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config(); // loads .env into process.env


const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env['API-KEY'] || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing SUPABASE_URL or API-KEY in .env');
  process.exit(1);
}

const out = `window.__ENV__ = {
  SUPABASE_URL: ${JSON.stringify(SUPABASE_URL)},
  SUPABASE_ANON_KEY: ${JSON.stringify(SUPABASE_ANON_KEY)}
};\n`;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// write env.js at project root
fs.writeFileSync(path.join(__dirname, '..', 'env.js'), out, 'utf8');
console.log('Generated env.js at project root');
