import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useCartStore } from '@/stores/cartStore';
import { formatCurrency } from '@/utils/currency';
import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';
import Card from '@/components/common/Card';

interface CartSummaryProps {
  showTitle?: boolean;
  style?: any;
}

export default function CartSummary({ showTitle = true, style }: CartSummaryProps) {
  // Use selector to get specific values instead of calling getCartSummary directly
  const items = useCartStore((state) => state.items);
  
  // Memoize the summary calculation to prevent infinite loops
  const summary = useMemo(() => {
    const itemCount = items.reduce((total, item) => total + item.quantity, 0);
    const subtotal = items.reduce((total, item) => total + item.subtotal, 0);
    
    // Calculate shipping (free for orders over 100,000 TZS)
    const shippingCost = subtotal >= 100000 ? 0 : 5000;
    
    // Calculate tax on subtotal
    const tax = Math.round(subtotal * 0.18); // 18% VAT
    
    const total = Math.round(subtotal + tax + shippingCost);

    return {
      itemCount,
      subtotal: Math.round(subtotal),
      tax: Math.round(tax),
      shippingCost: Math.round(shippingCost),
      total: Math.max(0, total),
    };
  }, [items]);

  return (
    <Card style={[styles.container, style]}>
      {showTitle && <Text style={styles.title}>Order Summary</Text>}
      
      <View style={styles.row}>
        <Text style={styles.label}>Subtotal ({summary.itemCount} items)</Text>
        <Text style={styles.value}>{formatCurrency(summary.subtotal)}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Shipping</Text>
        <Text style={styles.value}>
          {summary.shippingCost === 0 ? 'Free' : formatCurrency(summary.shippingCost)}
        </Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Tax (VAT 18%)</Text>
        <Text style={styles.value}>{formatCurrency(summary.tax)}</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>{formatCurrency(summary.total)}</Text>
      </View>

      {summary.subtotal >= 100000 && (
        <Text style={styles.freeShippingNote}>
          🎉 You qualify for free shipping!
        </Text>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  title: {
    ...Typography.h5,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    ...Typography.body,
    color: Colors.neutral[600],
  },
  value: {
    ...Typography.body,
    fontFamily: 'Inter-Medium',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.neutral[200],
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  totalLabel: {
    ...Typography.h5,
  },
  totalValue: {
    ...Typography.h4,
    color: Colors.primary[700],
  },
  freeShippingNote: {
    ...Typography.bodySmall,
    color: Colors.success[600],
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
  },
});