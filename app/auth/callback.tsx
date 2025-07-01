import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import Colors from '@/constants/Colors';

export default function AuthCallback() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Check if we're on web and have URL parameters
        if (typeof window !== 'undefined') {
          const urlParams = new URLSearchParams(window.location.hash.substring(1));
          const accessToken = urlParams.get('access_token');
          const refreshToken = urlParams.get('refresh_token');
          
          if (accessToken) {
            // Set the session from the URL parameters
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || '',
            });
            
            if (error) {
              console.error('Error setting session:', error);
              router.replace('/(onboarding)/auth');
              return;
            }
            
            console.log('Session set successfully:', data);
          }
        }
        
        // Wait a moment for the auth state to update
        setTimeout(() => {
          const { data: { session } } = supabase.auth.getSession();
          session.then(({ session }) => {
            if (session?.user) {
              console.log('User authenticated, redirecting to tabs');
              router.replace('/(tabs)');
            } else {
              console.log('No user found, redirecting to auth');
              router.replace('/(onboarding)/auth');
            }
          });
        }, 1000);
        
      } catch (error) {
        console.error('Auth callback error:', error);
        router.replace('/(onboarding)/auth');
      }
    };

    handleAuthCallback();
  }, [router]);

  // Also handle the auth context user state
  useEffect(() => {
    if (!loading) {
      if (user) {
        console.log('User found in context, redirecting to tabs');
        router.replace('/(tabs)');
      } else {
        console.log('No user in context, redirecting to auth');
        router.replace('/(onboarding)/auth');
      }
    }
  }, [user, loading, router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.primary[700]} />
      <Text style={styles.text}>Completing sign in...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.neutral[600],
  },
});