import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data: events, error: e1 } = await supabase.from('events').select('id, title, gallery');
  const { data: legacy, error: e2 } = await supabase.from('legacy_events').select('id, title, gallery');
  
  console.log("EVENTS:");
  console.table(events);
  
  console.log("LEGACY EVENTS:");
  console.table(legacy);
}
main();
