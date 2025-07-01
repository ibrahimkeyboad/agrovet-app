import React, { ReactNode } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import Colors from '@/constants/Colors';

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
}

export default function AuthGuard({ 
  children, 
  fallback, 
  redirectTo = '/(onboarding)/auth' 
}: AuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user && redirectTo) {
      router.replace(redirectTo as any);
    }
  }, [user, loading, redirectTo, router]);

  if (loading) {
    return fallback || (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary[700]} />
      </View>
    );
  }

  if (!user) {
    return fallback || null;
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
});