import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronRight, Package, Truck, CircleCheck as CheckCircle, Clock, X } from 'lucide-react-native';

import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';
import Card from '@/components/common/Card';
import { useSupabaseOrders } from '@/hooks/useSupabaseOrders';
import { formatCurrency } from '@/utils/currency';

export default function OrdersScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('all');
  const { 
    orders, 
    isLoading, 
    error, 
    refetch,
    getOrdersByStatus 
  } = useSupabaseOrders();

  useEffect(() => {
    console.log('Orders screen mounted, total orders:', orders.length);
  }, [orders.length]);

  const filterOrders = () => {
    if (activeTab === 'all') return orders;
    return getOrdersByStatus(activeTab as any);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return Colors.warning[500];
      case 'confirmed':
        return Colors.accent[500];
      case 'processing':
        return Colors.primary[600];
      case 'shipped':
        return Colors.secondary[600];
      case 'delivered':
        return Colors.success[500];
      case 'cancelled':
        return Colors.error[500];
      default:
        return Colors.neutral[500];
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock size={16} color={getStatusColor(status)} />;
      case 'confirmed':
        return <CheckCircle size={16} color={getStatusColor(status)} />;
      case 'processing':
        return <Package size={16} color={getStatusColor(status)} />;
      case 'shipped':
        return <Truck size={16} color={getStatusColor(status)} />;
      case 'delivered':
        return <CheckCircle size={16} color={getStatusColor(status)} />;
      case 'cancelled':
        return <X size={16} color={getStatusColor(status)} />;
      default:
        return <Package size={16} color={getStatusColor(status)} />;
    }
  };

  const renderFilterTabs = () => {
    const tabs = [
      { id: 'all', label: 'All', count: orders.length },
      { id: 'pending', label: 'Pending', count: getOrdersByStatus('pending').length },
      { id: 'confirmed', label: 'Confirmed', count: getOrdersByStatus('confirmed').length },
      { id: 'processing', label: 'Processing', count: getOrdersByStatus('processing').length },
      { id: 'shipped', label: 'Shipped', count: getOrdersByStatus('shipped').length },
      { id: 'delivered', label: 'Delivered', count: getOrdersByStatus('delivered').length },
    ];

    return (
      <View style={styles.tabContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              activeTab === tab.id && styles.activeTab,
            ]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab.id && styles.activeTabText,
              ]}
            >
              {tab.label}
            </Text>
            {tab.count > 0 && (
              <View style={[
                styles.tabBadge,
                activeTab === tab.id && styles.activeTabBadge,
              ]}>
                <Text style={[
                  styles.tabBadgeText,
                  activeTab === tab.id && styles.activeTabBadgeText,
                ]}>
                  {tab.count}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderOrder = ({ item }) => {
    return (
      <TouchableOpacity
        onPress={() => router.push({
          pathname: '/orders/track',
          params: {
            orderId: item.id,
            orderNumber: item.orderNumber,
            status: item.status,
          },
        })}
        activeOpacity={0.7}
      >
        <Card style={styles.orderCard}>
          <View style={styles.orderHeader}>
            <View>
              <Text style={styles.orderNumber}>Order #{item.orderNumber}</Text>
              <Text style={styles.orderDate}>
                {new Date(item.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
            <View style={styles.statusContainer}>
              {getStatusIcon(item.status)}
              <Text
                style={[
                  styles.statusText,
                  { color: getStatusColor(item.status) },
                ]}
              >
                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              </Text>
            </View>
          </View>

          <View style={styles.orderItems}>
            {item.items.slice(0, 2).map((orderItem) => (
              <View key={orderItem.id} style={styles.orderItemRow}>
                <Image
                  source={{ uri: orderItem.imageUrl }}
                  style={styles.itemImage}
                />
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName} numberOfLines={1}>
                    {orderItem.name}
                  </Text>
                  <Text style={styles.itemQuantity}>
                    Qty: {orderItem.quantity}
                  </Text>
                </View>
                <Text style={styles.itemPrice}>
                  {formatCurrency(orderItem.price)}
                </Text>
              </View>
            ))}
            {item.items.length > 2 && (
              <Text style={styles.moreItems}>
                +{item.items.length - 2} more items
              </Text>
            )}
          </View>

          <View style={styles.orderFooter}>
            <View>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalAmount}>{formatCurrency(item.total)}</Text>
            </View>
            <View style={styles.viewDetailButton}>
              <Text style={styles.viewDetailText}>Track Order</Text>
              <ChevronRight size={16} color={Colors.primary[700]} />
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Package size={64} color={Colors.neutral[400]} />
      <Text style={styles.emptyStateTitle}>No Orders Found</Text>
      <Text style={styles.emptyStateText}>
        {activeTab === 'all' 
          ? "You haven't placed any orders yet. Start shopping to see your orders here."
          : `No ${activeTab} orders found.`
        }
      </Text>
      {activeTab === 'all' && (
        <TouchableOpacity
          style={styles.shopButton}
          onPress={() => router.push('/(tabs)')}
        >
          <Text style={styles.shopButtonText}>Start Shopping</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={Colors.primary[700]} />
      <Text style={styles.loadingText}>Loading orders...</Text>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>Error: {error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={refetch}>
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  const filteredOrders = filterOrders();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Orders</Text>
        <Text style={styles.orderCount}>
          {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'}
        </Text>
      </View>

      {renderFilterTabs()}

      {isLoading && orders.length === 0 ? (
        renderLoadingState()
      ) : error ? (
        renderErrorState()
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.id}
          renderItem={renderOrder}
          contentContainerStyle={[
            styles.ordersList,
            filteredOrders.length === 0 && styles.emptyList,
          ]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={refetch}
              colors={[Colors.primary[700]]}
              tintColor={Colors.primary[700]}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  header: {
    backgroundColor: Colors.white,
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  title: {
    ...Typography.h3,
    marginBottom: 4,
  },
  orderCount: {
    ...Typography.body,
    color: Colors.neutral[600],
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: Colors.neutral[100],
  },
  activeTab: {
    backgroundColor: Colors.primary[700],
  },
  tabText: {
    ...Typography.bodySmall,
    color: Colors.neutral[600],
    fontFamily: 'Inter-Medium',
  },
  activeTabText: {
    color: Colors.white,
  },
  tabBadge: {
    backgroundColor: Colors.neutral[200],
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
    paddingHorizontal: 4,
  },
  activeTabBadge: {
    backgroundColor: Colors.white,
  },
  tabBadgeText: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    color: Colors.neutral[600],
  },
  activeTabBadgeText: {
    color: Colors.primary[700],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    ...Typography.body,
    color: Colors.neutral[600],
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  errorText: {
    ...Typography.body,
    color: Colors.error[600],
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: Colors.primary[700],
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    ...Typography.button,
    fontSize: 14,
  },
  ordersList: {
    padding: 16,
    paddingBottom: 40,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
  },
  orderCard: {
    marginBottom: 16,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  orderNumber: {
    ...Typography.h5,
    marginBottom: 2,
  },
  orderDate: {
    ...Typography.caption,
    color: Colors.neutral[600],
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral[100],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    ...Typography.caption,
    fontFamily: 'Inter-Medium',
    marginLeft: 4,
  },
  orderItems: {
    marginBottom: 16,
  },
  orderItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    ...Typography.body,
    fontFamily: 'Inter-Medium',
    marginBottom: 2,
  },
  itemQuantity: {
    ...Typography.caption,
    color: Colors.neutral[600],
  },
  itemPrice: {
    ...Typography.body,
    fontFamily: 'Inter-SemiBold',
  },
  moreItems: {
    ...Typography.caption,
    color: Colors.neutral[600],
    textAlign: 'center',
    marginTop: 4,
    fontStyle: 'italic',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[200],
  },
  totalLabel: {
    ...Typography.caption,
    color: Colors.neutral[600],
  },
  totalAmount: {
    ...Typography.h5,
    color: Colors.primary[700],
  },
  viewDetailButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewDetailText: {
    ...Typography.bodySmall,
    color: Colors.primary[700],
    fontFamily: 'Inter-Medium',
    marginRight: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    ...Typography.h4,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    ...Typography.body,
    color: Colors.neutral[600],
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  shopButton: {
    backgroundColor: Colors.primary[700],
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  shopButtonText: {
    ...Typography.button,
    fontSize: 14,
  },
});