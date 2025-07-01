import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  ShoppingCart,
  Truck,
  Headphones,
} from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';

import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

export default function LoginScreen() {
  const router = useRouter();
  const { user, error, clearError } = useAuth();

  // Redirect if user is already authenticated
  useEffect(() => {
    if (user) {
      router.replace('/(tabs)');
    }
  }, [user, router]);

  // Show error if authentication fails
  useEffect(() => {
    if (error) {
      Alert.alert('Authentication Error', error.message, [
        { text: 'OK', onPress: clearError },
      ]);
    }
  }, [error, clearError]);

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <ArrowLeft color={Colors.neutral[800]} size={24} />
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>AgriLink</Text>
          <Text style={styles.subtitle}>Join AgriLink</Text>
          <Text style={styles.description}>
            Connect with trusted suppliers and grow your Agrovet business
          </Text>
        </View>

        <GoogleSignInButton style={styles.googleButton} />

        <View style={styles.features}>
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <ShoppingCart size={24} color={Colors.primary[700]} />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Shop Quality Products</Text>
              <Text style={styles.featureDescription}>
                Access thousands of quality agricultural supplies
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Truck size={24} color={Colors.primary[700]} />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Fast Delivery</Text>
              <Text style={styles.featureDescription}>
                Get your orders delivered quickly to your farm
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Headphones size={24} color={Colors.primary[700]} />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Expert Support</Text>
              <Text style={styles.featureDescription}>
                Get advice from agricultural experts
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.terms}>
            By continuing, you agree to our{' '}
            <Text style={styles.link}>Terms of Service</Text> and{' '}
            <Text style={styles.link}>Privacy Policy</Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary[900],
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 24,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  content: {
    flex: 1,
    padding: 24,
    paddingTop: Platform.OS === 'ios' ? 120 : 100,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    ...Typography.h1,
    color: Colors.white,
    fontSize: 40,
    marginBottom: 16,
  },
  subtitle: {
    ...Typography.h3,
    color: Colors.white,
    marginBottom: 12,
  },
  description: {
    ...Typography.body,
    color: Colors.white,
    textAlign: 'center',
    opacity: 0.9,
  },
  googleButton: {
    marginBottom: 48,
  },
  features: {
    marginBottom: 48,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    ...Typography.h6,
    color: Colors.white,
    marginBottom: 4,
  },
  featureDescription: {
    ...Typography.bodySmall,
    color: Colors.white,
    opacity: 0.9,
  },
  footer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 48 : 24,
    left: 24,
    right: 24,
  },
  terms: {
    ...Typography.caption,
    textAlign: 'center',
    color: Colors.white,
    opacity: 0.8,
  },
  link: {
    textDecorationLine: 'underline',
  },
});
