import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import {
  ArrowLeft,
  ChevronRight,
  MapPin,
  CreditCard,
  Truck,
  Calendar,
  Check,
  Smartphone,
} from 'lucide-react-native';

import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import CartSummary from '@/components/cart/CartSummary';
import { useSupabaseCart } from '@/hooks/useSupabaseCart';
import { useSupabaseOrderStore } from '@/stores/supabaseOrderStore';
import { formatCurrency } from '@/utils/currency';

export default function CheckoutScreen() {
  const router = useRouter();
  const { items, getCartSummary, clearCart } = useSupabaseCart();
  const { createOrder } = useSupabaseOrderStore();
  
  const [deliveryMethod, setDeliveryMethod] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [isProcessing, setIsProcessing] = useState(false);

  const addresses = [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      company: '',
      address: '123 Main Street, Apartment 4B',
      apartment: '4B',
      city: 'Dar es Salaam',
      region: 'Dar es Salaam Region',
      postalCode: '11101',
      country: 'Tanzania',
      phone: '+255 712 345 678',
      isDefault: true,
    },
  ];

  const summary = getCartSummary();

  const calculateDeliveryFee = () => {
    return deliveryMethod === 'express' ? 10000 : 5000; // TZS
  };

  const calculateTotal = () => {
    return summary.total + calculateDeliveryFee() - summary.shippingCost; // Replace default shipping with selected
  };

  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      alert('Your cart is empty');
      return;
    }

    try {
      setIsProcessing(true);
      
      // Convert cart items to order items
      const orderItems = items.map(item => ({
        id: item.id,
        productId: item.productId,
        name: item.name,
        imageUrl: item.imageUrl,
        price: item.price,
        quantity: item.quantity,
        supplier: item.supplier,
        selectedVariants: item.selectedVariants,
        selectedOptions: item.selectedOptions,
        subtotal: item.subtotal,
      }));

      // Create shipping address object
      const shippingAddress = addresses[0];

      // Create payment method object
      const paymentMethodObj = {
        id: paymentMethod,
        type: paymentMethod === 'mpesa' ? 'mobile_money' : 'cash_on_delivery',
        provider: paymentMethod === 'mpesa' ? 'M-Pesa' : 'Cash on Delivery',
        isDefault: true,
      };

      // Create shipping method object
      const shippingMethodObj = {
        id: deliveryMethod,
        name: deliveryMethod === 'express' ? 'Express Delivery' : 'Standard Delivery',
        description: deliveryMethod === 'express' ? 'Delivery in 1-2 business days' : 'Delivery in 3-5 business days',
        price: calculateDeliveryFee(),
        estimatedDays: deliveryMethod === 'express' ? '1-2 days' : '3-5 days',
        regions: ['Dar es Salaam'],
      };

      // Create order summary
      const orderSummary = {
        subtotal: summary.subtotal,
        tax: summary.tax,
        shippingCost: calculateDeliveryFee(),
        discountAmount: summary.discountAmount || 0,
        total: calculateTotal(),
      };

      // Create the order using Supabase
      const newOrder = await createOrder(
        orderItems,
        shippingAddress,
        paymentMethodObj,
        shippingMethodObj,
        orderSummary,
        undefined // discount code
      );

      // Clear the cart after successful order creation
      await clearCart();
      
      // Navigate to success page with order data
      router.push({
        pathname: '/checkout/success',
        params: {
          orderNumber: newOrder.orderNumber,
          orderId: newOrder.id,
          orderDate: new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          }),
          totalAmount: calculateTotal().toString(),
          paymentMethod: paymentMethod === 'mpesa' ? 'M-Pesa' : 'Cash on Delivery',
          deliveryMethod: deliveryMethod === 'express' ? 'Express Delivery' : 'Standard Delivery',
          estimatedDelivery: (() => {
            const deliveryDate = new Date();
            const days = deliveryMethod === 'express' ? 2 : 5;
            deliveryDate.setDate(deliveryDate.getDate() + days);
            return deliveryDate.toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            });
          })(),
          orderStatus: 'pending',
        },
      });
    } catch (error) {
      console.error('Order failed:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Text style={styles.emptyText}>Add some items to your cart before checking out.</Text>
        <Button
          title="Continue Shopping"
          onPress={() => router.push('/(tabs)')}
          style={styles.continueButton}
        />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color={Colors.neutral[800]} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Checkout</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Shipping Address */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Shipping Address</Text>
              <TouchableOpacity style={styles.changeButton}>
                <Text style={styles.changeButtonText}>Change</Text>
                <ChevronRight size={16} color={Colors.primary[700]} />
              </TouchableOpacity>
            </View>

            <Card style={styles.addressCard}>
              <View style={styles.addressCardContent}>
                <View style={styles.addressIconContainer}>
                  <MapPin size={20} color={Colors.primary[700]} />
                </View>
                <View style={styles.addressInfo}>
                  <View style={styles.addressNameRow}>
                    <Text style={styles.addressName}>Home</Text>
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultBadgeText}>Default</Text>
                    </View>
                  </View>
                  <Text style={styles.addressText}>{addresses[0].address}</Text>
                  <Text style={styles.addressText}>
                    {addresses[0].city}, {addresses[0].region} {addresses[0].postalCode}
                  </Text>
                  <Text style={styles.addressText}>{addresses[0].phone}</Text>
                </View>
              </View>
            </Card>
          </View>

          {/* Delivery Method */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Delivery Method</Text>
            </View>

            <Card style={styles.optionsCard}>
              <TouchableOpacity
                style={[
                  styles.deliveryOption,
                  deliveryMethod === 'standard' && styles.deliveryOptionSelected,
                ]}
                onPress={() => setDeliveryMethod('standard')}
              >
                <View style={styles.deliveryOptionContent}>
                  <View style={[
                    styles.radioButton,
                    deliveryMethod === 'standard' && styles.radioButtonSelected
                  ]}>
                    {deliveryMethod === 'standard' && <View style={styles.radioButtonInner} />}
                  </View>
                  <View style={styles.deliveryIconContainer}>
                    <Truck size={20} color={Colors.primary[700]} />
                  </View>
                  <View style={styles.deliveryOptionInfo}>
                    <Text style={styles.deliveryOptionTitle}>Standard Delivery</Text>
                    <Text style={styles.deliveryOptionDescription}>
                      Delivery in 3-5 business days
                    </Text>
                  </View>
                </View>
                <Text style={styles.deliveryOptionPrice}>{formatCurrency(5000)}</Text>
              </TouchableOpacity>

              <View style={styles.optionDivider} />

              <TouchableOpacity
                style={[
                  styles.deliveryOption,
                  deliveryMethod === 'express' && styles.deliveryOptionSelected,
                ]}
                onPress={() => setDeliveryMethod('express')}
              >
                <View style={styles.deliveryOptionContent}>
                  <View style={[
                    styles.radioButton,
                    deliveryMethod === 'express' && styles.radioButtonSelected
                  ]}>
                    {deliveryMethod === 'express' && <View style={styles.radioButtonInner} />}
                  </View>
                  <View style={styles.deliveryIconContainer}>
                    <Truck size={20} color={Colors.accent[500]} />
                  </View>
                  <View style={styles.deliveryOptionInfo}>
                    <Text style={styles.deliveryOptionTitle}>Express Delivery</Text>
                    <Text style={styles.deliveryOptionDescription}>
                      Delivery in 1-2 business days
                    </Text>
                  </View>
                </View>
                <Text style={styles.deliveryOptionPrice}>{formatCurrency(10000)}</Text>
              </TouchableOpacity>
            </Card>
          </View>

          {/* Payment Method */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Payment Method</Text>
            </View>

            <Card style={styles.optionsCard}>
              <TouchableOpacity
                style={[
                  styles.paymentOption,
                  paymentMethod === 'mpesa' && styles.paymentOptionSelected,
                ]}
                onPress={() => setPaymentMethod('mpesa')}
              >
                <View style={styles.paymentOptionContent}>
                  <View style={[
                    styles.radioButton,
                    paymentMethod === 'mpesa' && styles.radioButtonSelected
                  ]}>
                    {paymentMethod === 'mpesa' && <View style={styles.radioButtonInner} />}
                  </View>
                  <View style={styles.paymentIconContainer}>
                    <Smartphone size={20} color={Colors.success[600]} />
                  </View>
                  <View style={styles.paymentMethodInfo}>
                    <Text style={styles.paymentOptionTitle}>M-Pesa</Text>
                    <Text style={styles.paymentOptionDescription}>Pay with mobile money</Text>
                  </View>
                </View>
                <View style={styles.popularBadge}>
                  <Text style={styles.popularBadgeText}>Popular</Text>
                </View>
              </TouchableOpacity>

              <View style={styles.optionDivider} />

              <TouchableOpacity
                style={[
                  styles.paymentOption,
                  paymentMethod === 'cod' && styles.paymentOptionSelected,
                ]}
                onPress={() => setPaymentMethod('cod')}
              >
                <View style={styles.paymentOptionContent}>
                  <View style={[
                    styles.radioButton,
                    paymentMethod === 'cod' && styles.radioButtonSelected
                  ]}>
                    {paymentMethod === 'cod' && <View style={styles.radioButtonInner} />}
                  </View>
                  <View style={styles.paymentIconContainer}>
                    <Calendar size={20} color={Colors.warning[500]} />
                  </View>
                  <View style={styles.paymentMethodInfo}>
                    <Text style={styles.paymentOptionTitle}>Cash on Delivery</Text>
                    <Text style={styles.paymentOptionDescription}>Pay when you receive</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </Card>
          </View>

          {/* Order Summary */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Order Summary</Text>
            </View>

            <Card style={styles.orderSummaryCard}>
              <View style={styles.orderItemsHeader}>
                <Text style={styles.orderItemsTitle}>Items ({items.length})</Text>
                <TouchableOpacity onPress={() => router.push('/cart')}>
                  <Text style={styles.viewAllText}>View All</Text>
                </TouchableOpacity>
              </View>

              {items.slice(0, 2).map((item) => (
                <View key={item.id} style={styles.orderItem}>
                  <Image source={{ uri: item.imageUrl }} style={styles.orderItemImage} />
                  <View style={styles.orderItemInfo}>
                    <Text style={styles.orderItemName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={styles.orderItemPrice}>{formatCurrency(item.price)} x {item.quantity}</Text>
                  </View>
                  <Text style={styles.orderItemTotal}>
                    {formatCurrency(item.subtotal)}
                  </Text>
                </View>
              ))}

              {items.length > 2 && (
                <Text style={styles.moreItems}>
                  +{items.length - 2} more items
                </Text>
              )}

              <View style={styles.summaryDivider} />

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>{formatCurrency(summary.subtotal)}</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Delivery Fee</Text>
                <Text style={styles.summaryValue}>{formatCurrency(calculateDeliveryFee())}</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tax (VAT 18%)</Text>
                <Text style={styles.summaryValue}>{formatCurrency(summary.tax)}</Text>
              </View>

              <View style={styles.summaryDivider} />

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>{formatCurrency(calculateTotal())}</Text>
              </View>
            </Card>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.footerTotal}>
            <Text style={styles.footerTotalLabel}>Total</Text>
            <Text style={styles.footerTotalValue}>{formatCurrency(calculateTotal())}</Text>
          </View>
          <Button
            title={isProcessing ? "Processing..." : "Place Order"}
            onPress={handlePlaceOrder}
            style={styles.placeOrderButton}
            loading={isProcessing}
            disabled={isProcessing}
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: Colors.white,
  },
  emptyTitle: {
    ...Typography.h3,
    marginBottom: 8,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.neutral[600],
    textAlign: 'center',
    marginBottom: 24,
  },
  continueButton: {
    width: '100%',
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
  headerTitle: {
    ...Typography.h4,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    ...Typography.h5,
  },
  changeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  changeButtonText: {
    ...Typography.bodySmall,
    color: Colors.primary[700],
    fontFamily: 'Inter-Medium',
    marginRight: 4,
  },
  addressCard: {
    padding: 16,
  },
  addressCardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  addressIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  addressInfo: {
    flex: 1,
  },
  addressNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressName: {
    ...Typography.body,
    fontFamily: 'Inter-SemiBold',
    marginRight: 8,
  },
  defaultBadge: {
    backgroundColor: Colors.primary[100],
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  defaultBadgeText: {
    ...Typography.caption,
    color: Colors.primary[700],
    fontFamily: 'Inter-Medium',
    fontSize: 10,
  },
  addressText: {
    ...Typography.body,
    color: Colors.neutral[600],
    marginBottom: 2,
    lineHeight: 20,
  },
  optionsCard: {
    padding: 0,
    overflow: 'hidden',
  },
  deliveryOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.white,
  },
  deliveryOptionSelected: {
    backgroundColor: Colors.primary[25],
  },
  deliveryOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.neutral[300],
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: Colors.primary[700],
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary[700],
  },
  deliveryIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  deliveryOptionInfo: {
    flex: 1,
  },
  deliveryOptionTitle: {
    ...Typography.body,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  deliveryOptionDescription: {
    ...Typography.caption,
    color: Colors.neutral[600],
  },
  deliveryOptionPrice: {
    ...Typography.body,
    fontFamily: 'Inter-SemiBold',
    color: Colors.primary[700],
  },
  optionDivider: {
    height: 1,
    backgroundColor: Colors.neutral[200],
    marginHorizontal: 16,
  },
  paymentOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.white,
  },
  paymentOptionSelected: {
    backgroundColor: Colors.primary[25],
  },
  paymentOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentOptionTitle: {
    ...Typography.body,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  paymentOptionDescription: {
    ...Typography.caption,
    color: Colors.neutral[600],
  },
  popularBadge: {
    backgroundColor: Colors.success[100],
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  popularBadgeText: {
    ...Typography.caption,
    color: Colors.success[700],
    fontFamily: 'Inter-Medium',
    fontSize: 10,
  },
  orderSummaryCard: {
    marginBottom: 24,
  },
  orderItemsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  orderItemsTitle: {
    ...Typography.body,
    fontFamily: 'Inter-SemiBold',
  },
  viewAllText: {
    ...Typography.bodySmall,
    color: Colors.primary[700],
    fontFamily: 'Inter-Medium',
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderItemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  orderItemInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  orderItemName: {
    ...Typography.body,
    marginBottom: 4,
  },
  orderItemPrice: {
    ...Typography.caption,
    color: Colors.neutral[600],
  },
  orderItemTotal: {
    ...Typography.body,
    fontFamily: 'Inter-SemiBold',
    color: Colors.primary[700],
  },
  moreItems: {
    ...Typography.caption,
    color: Colors.neutral[600],
    textAlign: 'center',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: Colors.neutral[200],
    marginVertical: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    ...Typography.body,
    color: Colors.neutral[600],
  },
  summaryValue: {
    ...Typography.body,
    fontFamily: 'Inter-Medium',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  totalLabel: {
    ...Typography.h5,
  },
  totalValue: {
    ...Typography.h4,
    color: Colors.primary[700],
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
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  footerTotal: {
    flex: 1,
  },
  footerTotalLabel: {
    ...Typography.caption,
    color: Colors.neutral[600],
  },
  footerTotalValue: {
    ...Typography.h5,
  },
  placeOrderButton: {
    width: 150,
  },
});