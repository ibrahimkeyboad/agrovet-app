import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter, Stack, useLocalSearchParams } from 'expo-router';
import { Package, Truck, CircleCheck as CheckCircle, MapPin, Chrome as Home, Clock, CircleAlert as AlertCircle, FileText } from 'lucide-react-native';

import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import { useOrderStore } from '@/stores/orderStore';

export default function TrackOrderScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    orderId?: string;
    orderNumber?: string;
    status?: string;
  }>();

  const { getOrder } = useOrderStore();

  // Get the actual order from the store
  const order = params.orderId ? getOrder(params.orderId) : null;

  // Fallback to params if order not found
  const orderStatus = order?.status || params.status || 'pending';
  const orderNumber = order?.orderNumber || params.orderNumber || 'AG80321';
  const statusHistory = order?.statusHistory || [];

  // Helper function to format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Helper function to get relative time
  const getRelativeTime = (timestamp: string) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    return formatTimestamp(timestamp);
  };

  // Generate timeline steps based on actual order data
  const generateTimelineSteps = () => {
    const baseSteps = [
      {
        status: 'pending',
        title: 'Order Placed',
        description: 'Your order has been received and is awaiting confirmation',
        icon: FileText,
      },
      {
        status: 'confirmed',
        title: 'Order Confirmed',
        description: 'Your order has been confirmed and approved',
        icon: CheckCircle,
      },
      {
        status: 'processing',
        title: 'Order Processing',
        description: 'Your order is being prepared and packed',
        icon: Package,
      },
      {
        status: 'shipped',
        title: 'Out for Delivery',
        description: 'Your order is on its way to you',
        icon: Truck,
      },
      {
        status: 'delivered',
        title: 'Delivered',
        description: 'Your order has been successfully delivered',
        icon: CheckCircle,
      },
    ];

    // If order is cancelled, show only the steps up to cancellation
    if (orderStatus === 'cancelled') {
      const cancelledStep = {
        status: 'cancelled',
        title: 'Order Cancelled',
        description: 'Your order has been cancelled',
        icon: AlertCircle,
        cancelled: true,
      };

      // Find the last completed step before cancellation
      const lastCompletedIndex = statusHistory.length > 0 
        ? baseSteps.findIndex(step => step.status === statusHistory[statusHistory.length - 2]?.status)
        : 0;

      return [
        ...baseSteps.slice(0, Math.max(1, lastCompletedIndex + 1)),
        cancelledStep,
      ];
    }

    return baseSteps;
  };

  const timelineSteps = generateTimelineSteps();

  // Map status history to timeline steps
  const getStepData = (step) => {
    const historyEntry = statusHistory.find(h => h.status === step.status);
    const currentStatusIndex = timelineSteps.findIndex(s => s.status === orderStatus);
    const stepIndex = timelineSteps.findIndex(s => s.status === step.status);

    let completed = false;
    let current = false;
    let timestamp = '';
    let relativeTime = '';

    if (historyEntry) {
      // Step has been completed
      completed = true;
      timestamp = formatTimestamp(historyEntry.timestamp);
      relativeTime = getRelativeTime(historyEntry.timestamp);
    } else if (stepIndex === currentStatusIndex && orderStatus !== 'cancelled') {
      // This is the current step (but not completed yet)
      current = true;
      timestamp = 'In progress';
      relativeTime = 'Current step';
    } else if (stepIndex > currentStatusIndex) {
      // Future step
      timestamp = 'Pending';
      relativeTime = '';
    }

    return {
      ...step,
      completed,
      current,
      timestamp,
      relativeTime,
    };
  };

  const getStatusMessage = (status: string) => {
    const messages = {
      pending: {
        title: 'Order Awaiting Confirmation',
        message: 'Your order is waiting to be confirmed by our team. You will receive an update once confirmed.',
        color: Colors.warning[500],
      },
      confirmed: {
        title: 'Order Confirmed',
        message: 'Great! Your order has been confirmed and is now being prepared.',
        color: Colors.success[500],
      },
      processing: {
        title: 'Order Being Prepared',
        message: 'Your order is currently being processed and will be ready for shipment soon.',
        color: Colors.accent[500],
      },
      shipped: {
        title: 'Order Out for Delivery',
        message: 'Your order is on its way! Track the delivery progress below.',
        color: Colors.primary[700],
      },
      delivered: {
        title: 'Order Delivered',
        message: 'Your order has been successfully delivered. Thank you for shopping with us!',
        color: Colors.success[500],
      },
      cancelled: {
        title: 'Order Cancelled',
        message: 'This order has been cancelled. If you have any questions, please contact support.',
        color: Colors.error[500],
      },
    };

    return messages[status] || {
      title: 'Order Status',
      message: 'Track your order progress below.',
      color: Colors.neutral[600],
    };
  };

  const statusInfo = getStatusMessage(orderStatus);

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <Package size={24} color={Colors.neutral[800]} />
          </TouchableOpacity>
          <Text style={styles.title}>Track Order</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <Card style={styles.orderInfo}>
            <Text style={styles.orderNumber}>Order #{orderNumber}</Text>
            <Text style={styles.orderDate}>
              {order ? formatTimestamp(order.createdAt) : 'Placed on May 18, 2025'}
            </Text>
          </Card>

          <Card style={[styles.statusCard, { borderLeftColor: statusInfo.color }]}>
            <View style={styles.statusHeader}>
              <View style={[styles.statusIcon, { backgroundColor: statusInfo.color }]}>
                {orderStatus === 'cancelled' ? (
                  <AlertCircle size={20} color={Colors.white} />
                ) : orderStatus === 'delivered' ? (
                  <CheckCircle size={20} color={Colors.white} />
                ) : (
                  <Clock size={20} color={Colors.white} />
                )}
              </View>
              <View style={styles.statusInfo}>
                <Text style={styles.statusTitle}>{statusInfo.title}</Text>
                <Text style={styles.statusMessage}>{statusInfo.message}</Text>
                {order && (
                  <Text style={styles.lastUpdated}>
                    Last updated: {getRelativeTime(order.updatedAt)}
                  </Text>
                )}
              </View>
            </View>
          </Card>

          <Card style={styles.deliveryInfo}>
            <View style={styles.deliveryHeader}>
              <MapPin size={20} color={Colors.primary[700]} />
              <Text style={styles.deliveryTitle}>Delivery Address</Text>
            </View>
            <Text style={styles.addressName}>
              {order ? `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}` : 'Home'}
            </Text>
            <Text style={styles.address}>
              {order ? (
                `${order.shippingAddress.address}\n${order.shippingAddress.city}, ${order.shippingAddress.region} ${order.shippingAddress.postalCode}`
              ) : (
                '123 Main Street, Apartment 4B\nDar es Salaam, Tanzania 11101'
              )}
            </Text>
          </Card>

          <View style={styles.timeline}>
            <Text style={styles.timelineTitle}>Order Progress</Text>
            {timelineSteps.map((step, index) => {
              const stepData = getStepData(step);
              
              return (
                <View key={index} style={styles.timelineItem}>
                  <View style={styles.timelineLeft}>
                    <View 
                      style={[
                        styles.timelineIcon,
                        stepData.completed && styles.timelineIconCompleted,
                        stepData.current && styles.timelineIconCurrent,
                        step.cancelled && styles.timelineIconCancelled,
                      ]}
                    >
                      <stepData.icon 
                        size={20} 
                        color={
                          step.cancelled 
                            ? Colors.white
                            : stepData.completed || stepData.current 
                              ? Colors.white 
                              : Colors.neutral[400]
                        } 
                      />
                    </View>
                    {index < timelineSteps.length - 1 && (
                      <View 
                        style={[
                          styles.timelineLine,
                          stepData.completed && styles.timelineLineCompleted,
                        ]} 
                      />
                    )}
                  </View>
                  <View style={styles.timelineContent}>
                    <Text style={[
                      styles.timelineStepTitle,
                      stepData.current && styles.currentStepTitle,
                      step.cancelled && styles.cancelledStepTitle,
                    ]}>
                      {stepData.title}
                    </Text>
                    <Text style={[
                      styles.timelineDescription,
                      stepData.current && styles.currentStepDescription,
                    ]}>
                      {stepData.description}
                    </Text>
                    <View style={styles.timelineTimestamps}>
                      <Text style={styles.timelineDate}>{stepData.timestamp}</Text>
                      {stepData.relativeTime && (
                        <Text style={styles.timelineRelative}>({stepData.relativeTime})</Text>
                      )}
                    </View>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Show tracking number if available */}
          {order?.trackingNumber && (
            <Card style={styles.trackingCard}>
              <Text style={styles.trackingTitle}>Tracking Information</Text>
              <Text style={styles.trackingNumber}>Tracking #: {order.trackingNumber}</Text>
              <Text style={styles.trackingNote}>
                Use this tracking number to get detailed delivery updates from our delivery partner.
              </Text>
            </Card>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title="View Order Details"
            onPress={() => router.push('/(tabs)/orders')}
            leftIcon={<Package size={20} color={Colors.white} />}
            style={styles.orderButton}
          />
          <Button
            title="Continue Shopping"
            onPress={() => router.push('/(tabs)')}
            variant="outline"
            leftIcon={<Home size={20} color={Colors.primary[700]} />}
            style={styles.homeButton}
          />
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  backButton: {
    padding: 4,
  },
  title: {
    ...Typography.h4,
  },
  content: {
    padding: 16,
    paddingBottom: 120,
  },
  orderInfo: {
    marginBottom: 16,
  },
  orderNumber: {
    ...Typography.h5,
    marginBottom: 4,
  },
  orderDate: {
    ...Typography.body,
    color: Colors.neutral[600],
  },
  statusCard: {
    marginBottom: 16,
    borderLeftWidth: 4,
    paddingLeft: 20,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  statusInfo: {
    flex: 1,
  },
  statusTitle: {
    ...Typography.h5,
    marginBottom: 4,
  },
  statusMessage: {
    ...Typography.body,
    color: Colors.neutral[600],
    lineHeight: 20,
    marginBottom: 4,
  },
  lastUpdated: {
    ...Typography.caption,
    color: Colors.neutral[500],
    fontStyle: 'italic',
  },
  deliveryInfo: {
    marginBottom: 24,
  },
  deliveryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  deliveryTitle: {
    ...Typography.h5,
    marginLeft: 8,
  },
  addressName: {
    ...Typography.body,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  address: {
    ...Typography.body,
    color: Colors.neutral[600],
    lineHeight: 20,
  },
  timeline: {
    paddingTop: 8,
    marginBottom: 24,
  },
  timelineTitle: {
    ...Typography.h5,
    marginBottom: 20,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  timelineLeft: {
    alignItems: 'center',
    width: 40,
  },
  timelineIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.neutral[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineIconCompleted: {
    backgroundColor: Colors.primary[700],
  },
  timelineIconCurrent: {
    backgroundColor: Colors.accent[500],
  },
  timelineIconCancelled: {
    backgroundColor: Colors.error[500],
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.neutral[200],
    marginVertical: 8,
  },
  timelineLineCompleted: {
    backgroundColor: Colors.primary[700],
  },
  timelineContent: {
    flex: 1,
    paddingLeft: 16,
    paddingBottom: 24,
  },
  timelineStepTitle: {
    ...Typography.body,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  currentStepTitle: {
    color: Colors.accent[600],
  },
  cancelledStepTitle: {
    color: Colors.error[600],
  },
  timelineDescription: {
    ...Typography.body,
    color: Colors.neutral[600],
    marginBottom: 6,
    lineHeight: 20,
  },
  currentStepDescription: {
    color: Colors.accent[700],
    fontFamily: 'Inter-Medium',
  },
  timelineTimestamps: {
    flexDirection: 'column',
  },
  timelineDate: {
    ...Typography.caption,
    color: Colors.neutral[700],
    fontFamily: 'Inter-Medium',
    marginBottom: 2,
  },
  timelineRelative: {
    ...Typography.caption,
    color: Colors.neutral[500],
    fontSize: 10,
  },
  trackingCard: {
    marginBottom: 24,
    backgroundColor: Colors.accent[25],
    borderWidth: 1,
    borderColor: Colors.accent[200],
  },
  trackingTitle: {
    ...Typography.h5,
    marginBottom: 8,
    color: Colors.accent[800],
  },
  trackingNumber: {
    ...Typography.body,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
    color: Colors.accent[700],
  },
  trackingNote: {
    ...Typography.bodySmall,
    color: Colors.accent[600],
    lineHeight: 18,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[200],
    padding: 16,
    paddingBottom: 32,
  },
  orderButton: {
    marginBottom: 12,
  },
  homeButton: {
    marginBottom: 0,
  },
});