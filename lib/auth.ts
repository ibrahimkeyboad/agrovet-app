import { supabase } from './supabase';
import { AuthError } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import Constants from 'expo-constants';

// Configure WebBrowser for auth redirects
WebBrowser.maybeCompleteAuthSession();

// Create redirect URL for the app
const getRedirectUrl = () => {
  if (Platform.OS === 'web') {
    // For web, use the current origin with the callback path
    return `${window.location.origin}/auth/callback`;
  } else {
    // For mobile, use the custom scheme
    return Linking.createURL('/auth/callback');
  }
};

console.log('Redirect URL:', getRedirectUrl());

export class AuthService {
  /**
   * Sign in with Google OAuth
   */
  static async signInWithGoogle() {
    try {
      const redirectTo = getRedirectUrl();
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        throw error;
      }

      // On web, the redirect happens automatically
      // On mobile, we need to handle the auth URL
      if (Platform.OS !== 'web' && data.url) {
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          redirectTo
        );

        if (result.type === 'success' && result.url) {
          // Extract the URL parameters and handle the auth callback
          const url = new URL(result.url);
          const params = new URLSearchParams(url.hash.substring(1));

          if (params.get('error')) {
            throw new Error(
              params.get('error_description') || 'Authentication failed'
            );
          }
        }
      }

      return { data, error: null };
    } catch (error) {
      console.error('Google sign-in error:', error);
      return {
        data: null,
        error:
          error instanceof Error ? error : new Error('Authentication failed'),
      };
    }
  }

  /**
   * Sign out the current user
   */
  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      return { error: null };
    } catch (error) {
      console.error('Sign out error:', error);
      return {
        error: error instanceof Error ? error : new Error('Sign out failed'),
      };
    }
  }

  /**
   * Get the current session
   */
  static async getSession() {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        throw error;
      }

      return { session, error: null };
    } catch (error) {
      console.error('Get session error:', error);
      return {
        session: null,
        error:
          error instanceof Error ? error : new Error('Failed to get session'),
      };
    }
  }

  /**
   * Get the current user
   */
  static async getUser() {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        throw error;
      }

      return { user, error: null };
    } catch (error) {
      console.error('Get user error:', error);
      return {
        user: null,
        error: error instanceof Error ? error : new Error('Failed to get user'),
      };
    }
  }

  /**
   * Refresh the current session
   */
  static async refreshSession() {
    try {
      const { data, error } = await supabase.auth.refreshSession();

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      console.error('Refresh session error:', error);
      return {
        data: null,
        error:
          error instanceof Error
            ? error
            : new Error('Failed to refresh session'),
      };
    }
  }
}