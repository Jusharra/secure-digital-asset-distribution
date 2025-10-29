import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'
import toast from 'react-hot-toast'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: window.localStorage,
      flowType: 'pkce'
    },
    global: {
      headers: {
        'x-client-info': 'supabase-js@2.39.7'
      }
    }
  }
)

// Handle auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
    // Clear auth data
    localStorage.removeItem('supabase.auth.token')
    localStorage.removeItem('supabase.auth.refreshToken')
    
    // Show notification
    toast.error('Session expired. Please sign in again.')
    
    // Redirect to login
    window.location.href = '/auth/login'
  }
})

// Handle refresh token errors
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'TOKEN_REFRESHED' && !session) {
    // Failed to refresh token
    localStorage.removeItem('supabase.auth.token')
    localStorage.removeItem('supabase.auth.refreshToken')
    toast.error('Session expired. Please sign in again.')
    window.location.href = '/auth/login'
  }
})