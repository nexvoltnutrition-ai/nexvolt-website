import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function check() {
  const { data, error } = await supabase.from('hero_slides').select('*').limit(1);
  console.log("hero_slides data:", JSON.stringify(data, null, 2));
  if (error) console.error("error:", error);
}
check();
