import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL || "", process.env.VITE_SUPABASE_ANON_KEY || "");
async function main() {
    let { data: coupons, error: cErr } = await supabase.from('coupons').select('*').limit(1);
    console.log("Coupons:", cErr ? cErr : "Exists");
    let { data: reviews, error: rErr } = await supabase.from('reviews').select('*').limit(1);
    console.log("Reviews:", rErr ? rErr : "Exists");
}
main();
