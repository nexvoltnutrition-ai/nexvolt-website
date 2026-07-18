import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function insert() {
  const { data, error } = await supabase.from('hero_slides').insert([{ enabled: true }]).select();
  console.log("inserted:", JSON.stringify(data, null, 2));
  if (error) console.error("error:", error);
}
insert();
