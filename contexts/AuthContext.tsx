import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { AuthService } from '@/lib/auth';
import { AuthContextType, AuthState, User, AuthSession, AuthError } from '@/types/auth';
import { AuthChangeEvent, Session } from '@supabase/supabase-js';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
  });

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    async function initializeAuth() {
      try {
        // Get initial session
        const { session, error } = await AuthService.getSession();
        
        if (mounted) {
          if (error) {
            setState(prev => ({
              ...prev,
              loading: false,
              error: { message: error.message },
            }));
          } else {
            setState(prev => ({
              ...prev,
              user: session?.user || null,
              session: session as AuthSession | null,
              loading: false,
              error: null,
            }));
          }
        }
      } catch (error) {
        if (mounted) {
          setState(prev => ({
            ...prev,
            loading: false,
            error: { 
              message: error instanceof Error ? error.message : 'Failed to initialize auth' 
            },
          }));
        }
      }
    }

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, []);

  // Listen for auth changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        console.log('Auth state changed:', event, session?.user?.email);

        setState(prev => ({
          ...prev,
          user: session?.user as User | null,
          session: session as AuthSession | null,
          loading: false,
          error: null,
        }));

        // Handle specific auth events
        switch (event) {
          case 'SIGNED_IN':
            console.log('User signed in:', session?.user?.email);
            break;
          case 'SIGNED_OUT':
            console.log('User signed out');
            break;
          case 'TOKEN_REFRESHED':
            console.log('Token refreshed for user:', session?.user?.email);
            break;
          case 'USER_UPDATED':
            console.log('User updated:', session?.user?.email);
            break;
          case 'PASSWORD_RECOVERY':
            console.log('Password recovery initiated');
            break;
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const { error } = await AuthService.signInWithGoogle();
      
      if (error) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: { message: error.message },
        }));
      }
      // Success state will be handled by the auth state change listener
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: { 
          message: error instanceof Error ? error.message : 'Google sign-in failed' 
        },
      }));
    }
  };

  const signOut = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const { error } = await AuthService.signOut();
      
      if (error) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: { message: error.message },
        }));
      }
      // Success state will be handled by the auth state change listener
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: { 
          message: error instanceof Error ? error.message : 'Sign out failed' 
        },
      }));
    }
  };

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  const value: AuthContextType = {
    ...state,
    signInWithGoogle,
    signOut,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}