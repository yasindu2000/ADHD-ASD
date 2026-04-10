import { createClient } from '@supabase/supabase-js';

// Oyage Supabase project settings walin me keys deka ganna puluwan
const supabaseUrl = 'https://ijqplhzymzggmsvflfsl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqcXBsaHp5bXpnZ21zdmZsZnNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3NDY2ODUsImV4cCI6MjA5MTMyMjY4NX0.MeCOMt6XiAXira9bZVzY2yL-Afa9Tt9NSw-ySmO77k0';

export const supabase = createClient(supabaseUrl, supabaseKey);