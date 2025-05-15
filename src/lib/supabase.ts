import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hvnighqklagozkpztjuc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2bmlnaHFrbGFnb3prcHp0anVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyNjA5OTMsImV4cCI6MjA2MjgzNjk5M30.S3ZqVlcEZ9s7c-KuShF6z0AJovq0YM_W6hJ49joyFLg';

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface Contact {
  id: number;
  name: string;
  company: string;
  contact: string;
  tags: string;
  intimacy: string;
  notes: string;
  created_at: string;
} 