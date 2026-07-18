import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
  const { data, error } = await supabase.from('announcement_bar').select('id,enabled,text,link,open_new_tab,bg_color,text_color,font_size,font_weight,height,text_align,marquee,marquee_speed,pause_on_hover,close_button,sticky,start_date,end_date,updated_at').limit(1);
  console.log({ data, error });
}
run();
