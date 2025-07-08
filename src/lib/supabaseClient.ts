import { createClient } from '@supabase/supabase-js';

// Supabase configuration with fallback for demo mode
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://demo.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'demo-key';

// Check if we have valid Supabase credentials
const hasValidCredentials = supabaseUrl !== 'https://demo.supabase.co' && 
                           supabaseAnonKey !== 'demo-key' &&
                           supabaseUrl.includes('supabase.co');

export const supabase = hasValidCredentials ? createClient(supabaseUrl, supabaseAnonKey) : null;
export const isSupabaseConfigured = hasValidCredentials;
// Helper function to get current user
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// Helper function for authentication
export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signUpWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};