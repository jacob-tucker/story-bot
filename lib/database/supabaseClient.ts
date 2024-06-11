// Supabase
const { createClient } = require('@supabase/supabase-js');

// Create a single supabase client for interacting with your database
export const supabaseClient = createClient(process.env.PUBLIC_BOT_SUPABASE_URL, process.env.BOT_SUPABASE_SERVICE_KEY);