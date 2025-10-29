import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface User {
  id: string;
  email: string;
}

export interface AuthState {
  user: User | null;
  role: 'admin' | 'creator' | 'retailer' | 'courier' | 'consumer' | null;
  signOut: () => Promise<void>;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AuthState['role']>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || ''
        });
        fetchUserRole(session.user.id);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || ''
        });
        fetchUserRole(session.user.id);
      } else {
        setUser(null);
        setRole(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // User doesn't exist, create with default role
          const { data: newUser, error: createError } = await supabase
            .from('users')
            .upsert([{ 
              id: userId, 
              role: 'consumer',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }])
            .select('role')
            .single();

          if (createError) throw createError;
          setRole(newUser.role as AuthState['role']);
        } else {
          throw error;
        }
      } else if (data) {
        setRole(data.role as AuthState['role']);
      }
    } catch (err) {
      console.error('Error fetching user role:', err);
      setRole('consumer'); // Default to consumer on error
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return { user, role, signOut };
}