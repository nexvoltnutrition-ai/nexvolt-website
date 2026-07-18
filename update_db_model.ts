import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL as string, process.env.VITE_SUPABASE_ANON_KEY as string);

async function run() {
  await supabase.from('nexai_settings').update({ gemini_model: 'gemini-2.5-flash' }).not('id', 'is', null);
  console.log("Updated DB");
}
run();
