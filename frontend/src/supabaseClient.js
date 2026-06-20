import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://uahqsdvlekcadxszyznl.supabase.co";
const supabaseAnonKey = "sb_publishable_PrG0vxDkfgq8VWzWi6cF9Q_Y-0330Gq";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
