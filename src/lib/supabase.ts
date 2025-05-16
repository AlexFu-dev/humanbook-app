import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yoxdchhonsmuzkdqbwvv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlveGRjaGhvbnNtdXprZHFid3Z2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczMzgxNzEsImV4cCI6MjA2MjkxNDE3MX0.XTvBIibxiesRSFDjTs-vyBJlaaEujZBQabd1CLR5Atk';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
});

// Helper function to check if user is authenticated
export async function isAuthenticated() {
  const { data: { session }, error } = await supabase.auth.getSession();
  return !!session;
}

// Helper function to check if contacts bucket exists
export async function checkContactsBucket() {
  try {
    // Try to list files in the contacts bucket directly
    const { data, error } = await supabase.storage
      .from('contacts')
      .list();
    
    if (error) {
      console.error('Error accessing contacts bucket:', error);
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error };
  }
}

export type Contact = {
  id: number;
  name: string;
  company?: string;
  contact?: string;
  tags?: string;
  intimacy: 'Close Contact' | 'Regular Contact' | 'Potential Contact';
  image_url?: string;
  created_at: string;
  notes?: string;
}; 