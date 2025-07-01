import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
  Easing,
} from 'react-native';
import { useRouter, Stack, useLocalSearchParams } from 'expo-router';
import { CircleCheck as CheckCircle } from 'lucide-react-native';

import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';
import Button from '@/components/common/Button';
import { formatCurrency } from '@/utils/currency';

export default function OrderSuccessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    orderNumber: string;
    orderId: string;
    orderDate: string;
    totalAmount: string;
    paymentMethod: string;
    deliveryMethod: string;
    estimatedDelivery: string;
    orderStatus: string;
  }>();

  const scaleAnim = new Animated.Value(0);
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.elastic(1),
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleTrackOrder = () => {
    // Navigate to track order with the order details
    router.push({
      pathname: '/orders/track',
      params: {
        orderId: params.orderId,
        orderNumber: params.orderNumber,
        status: params.orderStatus || 'pending',
      },
    });
  };

  const handleContinueShopping = () => {
    router.replace('/(tabs)');
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />

      <View style={styles.container}>
        <Animated.View
          style={[
            styles.checkCircle,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <CheckCircle size={80} color={Colors.white} fill={Colors.success[500]} />
        </Animated.View>

        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.title}>Order Placed Successfully!</Text>
          <Text style={styles.message}>
            Thank you for your order. Your order #{params.orderNumber} has been placed successfully and is awaiting confirmation.
          </Text>

          <View style={styles.orderDetails}>
            <View style={styles.orderDetailRow}>
              <Text style={styles.orderDetailLabel}>Order Number:</Text>
              <Text style={styles.orderDetailValue}>#{params.orderNumber}</Text>
            </View>
            <View style={styles.orderDetailRow}>
              <Text style={styles.orderDetailLabel}>Order Date:</Text>
              <Text style={styles.orderDetailValue}>{params.orderDate}</Text>
            </View>
            <View style={styles.orderDetailRow}>
              <Text style={styles.orderDetailLabel}>Total Amount:</Text>
              <Text style={styles.orderDetailValue}>{formatCurrency(parseInt(params.totalAmount || '0'))}</Text>
            </View>
            <View style={styles.orderDetailRow}>
              <Text style={styles.orderDetailLabel}>Payment Method:</Text>
              <Text style={styles.orderDetailValue}>{params.paymentMethod}</Text>
            </View>
            <View style={styles.orderDetailRow}>
              <Text style={styles.orderDetailLabel}>Delivery Method:</Text>
              <Text style={styles.orderDetailValue}>{params.deliveryMethod}</Text>
            </View>
            <View style={styles.orderDetailRow}>
              <Text style={styles.orderDetailLabel}>Status:</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>Pending Confirmation</Text>
              </View>
            </View>
          </View>

          <View style={styles.deliveryInfo}>
            <Text style={styles.deliveryTitle}>Estimated Delivery</Text>
            <Text style={styles.deliveryDate}>{params.estimatedDelivery}</Text>
            <Text style={styles.deliveryNote}>
              *Delivery will begin after order confirmation
            </Text>
          </View>

          <View style={styles.imageContainer}>
            <Image
              source={{ uri: 'https://images.pexels.com/photos/7706434/pexels-photo-7706434.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' }}
              style={styles.image}
            />
          </View>
        </Animated.View>

        <View style={styles.buttons}>
          <Button
            title="Track Order"
            onPress={handleTrackOrder}
            style={styles.trackButton}
          />
          <Button
            title="Continue Shopping"
            onPress={handleContinueShopping}
            variant="outline"
            style={styles.continueButton}
          />
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingTop: 80,
    paddingHorizontal: 24,
  },
  checkCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.success[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  title: {
    ...Typography.h2,
    textAlign: 'center',
    marginBottom: 16,
  },
  message: {
    ...Typography.body,
    textAlign: 'center',
    color: Colors.neutral[600],
    marginBottom: 32,
    lineHeight: 22,
  },
  orderDetails: {
    width: '100%',
    backgroundColor: Colors.neutral[50],
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  orderDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderDetailLabel: {
    ...Typography.body,
    color: Colors.neutral[600],
  },
  orderDetailValue: {
    ...Typography.body,
    fontFamily: 'Inter-SemiBold',
  },
  statusBadge: {
    backgroundColor: Colors.warning[100],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    ...Typography.caption,
    color: Colors.warning[700],
    fontFamily: 'Inter-Medium',
    fontSize: 10,
  },
  deliveryInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  deliveryTitle: {
    ...Typography.body,
    color: Colors.neutral[600],
    marginBottom: 4,
  },
  deliveryDate: {
    ...Typography.h5,
    color: Colors.primary[700],
    marginBottom: 4,
  },
  deliveryNote: {
    ...Typography.caption,
    color: Colors.neutral[500],
    fontStyle: 'italic',
    textAlign: 'center',
  },
  imageContainer: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 32,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  buttons: {
    position: 'absolute',
    bottom: 40,
    left: 24,
    right: 24,
  },
  trackButton: {
    marginBottom: 12,
  },
  continueButton: {},
});