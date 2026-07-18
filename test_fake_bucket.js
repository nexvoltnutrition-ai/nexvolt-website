import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
  const { data, error } = await supabase.storage.from('this_bucket_does_not_exist_123').upload('test.png', new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]), { contentType: 'image/png' });
  console.log("Fake bucket upload result:", { data, error });
}
test();
