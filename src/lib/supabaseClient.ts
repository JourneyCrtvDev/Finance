import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check if we're in development and missing credentials
const isDevelopment = import.meta.env.DEV;
const hasCredentials = supabaseUrl && supabaseAnonKey;

if (!hasCredentials && isDevelopment) {
  console.error('❌ Supabase credentials are missing. Database operations will fail.');
  console.log('To fix this:');
  console.log('1. Click "Connect to Supabase" button in the top right');
  console.log('2. Or manually add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file');
}

// Create client with fallback values to prevent immediate crashes
export const supabase = hasCredentials 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
export const getCurrentUser = async () => {
  if (!supabase) {
    throw new Error('Supabase is not configured. Please check your environment variables.');
  }
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const signUpWithEmail = async (email: string, password: string) => {
  if (!supabase) {
    throw new Error('Supabase is not configured. Please check your environment variables.');
  }
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
};

export const signInWithEmail = async (email: string, password: string) => {
  if (!supabase) {
    throw new Error('Supabase is not configured. Please check your environment variables.');
  }
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  if (!supabase) {
    throw new Error('Supabase is not configured. Please check your environment variables.');
  }
  await supabase.auth.signOut();
};