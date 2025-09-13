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
  try {
    if (!hasCredentials) {
      console.warn('Supabase credentials not available');
      return null;
    }
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      console.error('Auth error:', error);
      return null;
    }
    return user;
  } catch (error) {
    console.error('Failed to get current user:', error);
    return null;
  }
};

export const signUpWithEmail = async (email: string, password: string) => {
  try {
    if (!hasCredentials) {
      return { 
        data: { user: null, session: null }, 
        error: { message: 'Supabase is not configured. Please connect to Supabase first.' } 
      };
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  } catch (error) {
    return { 
      data: { user: null, session: null }, 
      error: { message: `Connection failed: ${error}` } 
    };
  }
};

export const signInWithEmail = async (email: string, password: string) => {
  try {
    if (!hasCredentials) {
      return { 
        data: { user: null, session: null }, 
        error: { message: 'Supabase is not configured. Please connect to Supabase first.' } 
      };
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  } catch (error) {
    return { 
      data: { user: null, session: null }, 
      error: { message: `Connection failed: ${error}` } 
    };
  }
};

export const signOut = async () => {
  try {
    if (!hasCredentials) {
      console.warn('Supabase not configured, cannot sign out');
      return;
    }
    await supabase.auth.signOut();
  } catch (error) {
    console.error('Sign out failed:', error);
  }
};