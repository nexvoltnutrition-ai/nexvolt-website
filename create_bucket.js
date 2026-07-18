import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function create() {
  const { data, error } = await supabase.storage.createBucket('homepage', {
    public: true
  });
  if (error) {
    console.error("Error creating bucket:", error);
  } else {
    console.log("Bucket created:", data);
  }
}
create();
