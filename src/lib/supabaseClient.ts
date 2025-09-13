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

// Create a mock client that throws helpful errors when credentials are missing
const createMockClient = () => ({
  auth: {
    getUser: () => Promise.reject(new Error('Supabase not configured. Please connect to Supabase first.')),
    signUp: () => Promise.reject(new Error('Supabase not configured. Please connect to Supabase first.')),
    signInWithPassword: () => Promise.reject(new Error('Supabase not configured. Please connect to Supabase first.')),
    signOut: () => Promise.reject(new Error('Supabase not configured. Please connect to Supabase first.')),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
  },
  from: () => ({
    select: () => Promise.reject(new Error('Supabase not configured. Please connect to Supabase first.')),
    insert: () => Promise.reject(new Error('Supabase not configured. Please connect to Supabase first.')),
    update: () => Promise.reject(new Error('Supabase not configured. Please connect to Supabase first.')),
    delete: () => Promise.reject(new Error('Supabase not configured. Please connect to Supabase first.'))
  })
});

// Create client with fallback to mock client
export const supabase = hasCredentials 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createMockClient();

export const getCurrentUser = async () => {
  if (!hasCredentials) {
    throw new Error('Supabase is not configured. Please check your environment variables.');
  }
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const signUpWithEmail = async (email: string, password: string) => {
  if (!hasCredentials) {
    throw new Error('Supabase is not configured. Please check your environment variables.');
  }
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
};

export const signInWithEmail = async (email: string, password: string) => {
  if (!hasCredentials) {
    throw new Error('Supabase is not configured. Please check your environment variables.');
  }
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  if (!hasCredentials) {
    throw new Error('Supabase is not configured. Please check your environment variables.');
  }
  await supabase.auth.signOut();
};