import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Minus, Plus, X } from 'lucide-react-native';

import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import CartSummary from '@/components/cart/CartSummary';
import { useSupabaseCart } from '@/hooks/useSupabaseCart';
import { formatCurrency } from '@/utils/currency';

export default function CartScreen() {
  const router = useRouter();
  const { 
    items, 
    isEmpty, 
    isLoading,
    error,
    removeFromCart, 
    updateItemQuantity, 
    clearCart,
    getCartSummary,
    refetch,
  } = useSupabaseCart(); // Using Supabase cart

  const handleRemoveItem = (itemId: string) => {
    Alert.alert(
      "Remove Item",
      "Are you sure you want to remove this item from your cart?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Remove", 
          onPress: () => removeFromCart(itemId),
          style: "destructive"
        }
      ]
    );
  };

  const proceedToCheckout = () => {
    router.push('/checkout');
  };

  if (isLoading && items.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary[700]} />
        <Text style={styles.loadingText}>Loading cart...</Text>
      </View>
    );
  }

  if (isEmpty) {
    return (
      <View style={styles.emptyContainer}>
        <Image
          source={{ uri: 'https://images.pexels.com/photos/1303084/pexels-photo-1303084.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' }}
          style={styles.emptyImage}
        />
        <Text style={styles.emptyTitle}>Your Cart is Empty</Text>
        <Text style={styles.emptySubtitle}>
          Looks like you haven't added anything to your cart yet
        </Text>
        <Button
          title="Start Shopping"
          onPress={() => router.push('/(tabs)')}
          style={styles.shopButton}
        />
      </View>
    );
  }

  const summary = getCartSummary();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Shopping Cart</Text>
        <Text style={styles.itemCount}>{summary.itemCount} items</Text>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refetch}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            colors={[Colors.primary[700]]}
            tintColor={Colors.primary[700]}
          />
        }
      >
        <View style={styles.itemsContainer}>
          {items.map((item) => (
            <Card key={item.id} style={styles.cartItem}>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveItem(item.id)}
              >
                <X size={16} color={Colors.neutral[500]} />
              </TouchableOpacity>

              <View style={styles.itemContent}>
                <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
                <View style={styles.itemDetails}>
                  <Text style={styles.itemSupplier}>{item.supplier}</Text>
                  <Text style={styles.itemName} numberOfLines={2}>
                    {item.name}
                  </Text>
                  <Text style={styles.itemPrice}>{formatCurrency(item.price)}</Text>
                  
                  {/* Show selected variants */}
                  {item.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
                    <View style={styles.variantsContainer}>
                      {Object.entries(item.selectedVariants).map(([key, value]) => (
                        <Text key={key} style={styles.variantText}>
                          {key}: {value}
                        </Text>
                      ))}
                    </View>
                  )}
                </View>
              </View>

              <View style={styles.quantityControl}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => updateItemQuantity(item.id, item.quantity - 1)}
                  disabled={isLoading}
                >
                  <Minus size={16} color={Colors.neutral[700]} />
                </TouchableOpacity>
                <Text style={styles.quantityText}>{item.quantity}</Text>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => updateItemQuantity(item.id, item.quantity + 1)}
                  disabled={isLoading}
                >
                  <Plus size={16} color={Colors.neutral[700]} />
                </TouchableOpacity>
              </View>
            </Card>
          ))}
        </View>

        <CartSummary />
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.totalSummary}>
          <Text style={styles.footerTotalLabel}>Total</Text>
          <Text style={styles.footerTotalValue}>{formatCurrency(summary.total)}</Text>
        </View>
        <Button
          title="Checkout"
          onPress={proceedToCheckout}
          style={styles.checkoutButton}
          disabled={isLoading || isEmpty}
          loading={isLoading}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  loadingText: {
    ...Typography.body,
    color: Colors.neutral[600],
    marginTop: 12,
  },
  header: {
    backgroundColor: Colors.white,
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  title: {
    ...Typography.h3,
    marginBottom: 4,
  },
  itemCount: {
    ...Typography.body,
    color: Colors.neutral[600],
  },
  errorContainer: {
    backgroundColor: Colors.error[50],
    padding: 12,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  errorText: {
    ...Typography.bodySmall,
    color: Colors.error[700],
    flex: 1,
  },
  retryButton: {
    backgroundColor: Colors.error[600],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  retryButtonText: {
    ...Typography.bodySmall,
    color: Colors.white,
    fontFamily: 'Inter-Medium',
  },
  itemsContainer: {
    padding: 16,
  },
  cartItem: {
    marginBottom: 12,
    position: 'relative',
  },
  removeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 1,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemContent: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
    paddingRight: 24,
  },
  itemSupplier: {
    ...Typography.caption,
    color: Colors.primary[700],
    marginBottom: 2,
  },
  itemName: {
    ...Typography.body,
    fontFamily: 'Inter-Medium',
    marginBottom: 4,
  },
  itemPrice: {
    ...Typography.price,
    marginBottom: 4,
  },
  variantsContainer: {
    marginTop: 4,
  },
  variantText: {
    ...Typography.caption,
    color: Colors.neutral[600],
    marginBottom: 2,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    ...Typography.body,
    fontFamily: 'Inter-Medium',
    marginHorizontal: 12,
    minWidth: 24,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    padding: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[200],
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalSummary: {
    flex: 1,
  },
  footerTotalLabel: {
    ...Typography.caption,
    color: Colors.neutral[600],
  },
  footerTotalValue: {
    ...Typography.h5,
  },
  checkoutButton: {
    width: 150,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: Colors.white,
  },
  emptyImage: {
    width: 200,
    height: 200,
    marginBottom: 24,
  },
  emptyTitle: {
    ...Typography.h3,
    marginBottom: 8,
  },
  emptySubtitle: {
    ...Typography.body,
    color: Colors.neutral[600],
    textAlign: 'center',
    marginBottom: 32,
  },
  shopButton: {
    width: '100%',
  },
});