import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  Image,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';

interface GoogleSignInButtonProps {
  onPress?: () => void;
  disabled?: boolean;
  style?: any;
}

export default function GoogleSignInButton({ 
  onPress, 
  disabled = false, 
  style 
}: GoogleSignInButtonProps) {
  const { signInWithGoogle, loading } = useAuth();

  const handlePress = async () => {
    if (onPress) {
      onPress();
    } else {
      await signInWithGoogle();
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.disabled, style]}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={Colors.neutral[600]} size="small" />
      ) : (
        <View style={styles.content}>
          <Image
            source={{
              uri: 'https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg'
            }}
            style={styles.googleIcon}
          />
          <Text style={styles.text}>Continue with Google</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: Colors.neutral[300],
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    minHeight: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.6,
    backgroundColor: Colors.neutral[100],
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  text: {
    ...Typography.button,
    color: Colors.neutral[900],
    fontSize: 16,
    textTransform: 'none',
  },
});