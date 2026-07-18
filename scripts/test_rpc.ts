import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.VITE_SUPABASE_URL || "", process.env.VITE_SUPABASE_ANON_KEY || "");
async function main() {
    let { data, error } = await supabase.rpc('execute_sql', { query: 'SELECT 1' });
    console.log("execute_sql:", error);
}
main();
