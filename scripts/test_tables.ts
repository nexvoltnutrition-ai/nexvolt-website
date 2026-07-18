import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.VITE_SUPABASE_URL || "", process.env.VITE_SUPABASE_ANON_KEY || "");
async function main() {
    const names = ['promos', 'discounts', 'coupon_codes', 'vouchers', 'promo_codes'];
    for(const n of names) {
        let { error } = await supabase.from(n).select('*').limit(1);
        if(!error || error.code !== 'PGRST205') console.log("Table exists:", n);
    }
}
main();
