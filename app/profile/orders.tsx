import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { ArrowLeft, ChevronRight, Package, Truck, CircleCheck as CheckCircle, Clock, Search } from 'lucide-react-native';

import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';
import Card from '@/components/common/Card';
import SearchBar from '@/components/common/SearchBar';
import { mockOrders } from '@/data/mockData';

export default function OrderHistoryScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const filters = [
    { id: 'all', label: 'All Orders' },
    { id: 'processing', label: 'Processing' },
    { id: 'shipped', label: 'Shipped' },
    { id: 'delivered', label: 'Delivered' },
  ];

  const filteredOrders = mockOrders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFilter = activeFilter === 'all' || order.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing':
        return Colors.warning[500];
      case 'shipped':
        return Colors.accent[500];
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
      case 'processing':
        return <Clock size={16} color={getStatusColor(status)} />;
      case 'shipped':
        return <Truck size={16} color={getStatusColor(status)} />;
      case 'delivered':
        return <CheckCircle size={16} color={getStatusColor(status)} />;
      default:
        return <Package size={16} color={getStatusColor(status)} />;
    }
  };

  const renderFilterTabs = () => (
    <View style={styles.filterContainer}>
      {filters.map((filter) => (
        <TouchableOpacity
          key={filter.id}
          style={[
            styles.filterTab,
            activeFilter === filter.id && styles.activeFilterTab,
          ]}
          onPress={() => setActiveFilter(filter.id)}
        >
          <Text
            style={[
              styles.filterTabText,
              activeFilter === filter.id && styles.activeFilterTabText,
            ]}
          >
            {filter.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderOrder = ({ item }) => (
    <TouchableOpacity
      onPress={() => router.push(`/orders/${item.id}`)}
      activeOpacity={0.7}
    >
      <Card style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <View>
            <Text style={styles.orderNumber}>#{item.orderNumber}</Text>
            <Text style={styles.orderDate}>{item.date}</Text>
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
                ₹{orderItem.price.toFixed(2)}
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
            <Text style={styles.totalAmount}>₹{item.total.toFixed(2)}</Text>
          </View>
          <View style={styles.viewDetailButton}>
            <Text style={styles.viewDetailText}>View Details</Text>
            <ChevronRight size={16} color={Colors.primary[700]} />
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Package size={64} color={Colors.neutral[400]} />
      <Text style={styles.emptyStateTitle}>No Orders Found</Text>
      <Text style={styles.emptyStateText}>
        {searchQuery 
          ? 'No orders match your search criteria'
          : 'You haven\'t placed any orders yet'
        }
      </Text>
    </View>
  );

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
            <ArrowLeft size={24} color={Colors.neutral[800]} />
          </TouchableOpacity>
          <Text style={styles.title}>Order History</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.searchContainer}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search orders..."
            onClear={() => setSearchQuery('')}
          />
        </View>

        {renderFilterTabs()}

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
        />
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
  searchContainer: {
    backgroundColor: Colors.white,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  filterTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: Colors.neutral[100],
  },
  activeFilterTab: {
    backgroundColor: Colors.primary[700],
  },
  filterTabText: {
    ...Typography.bodySmall,
    color: Colors.neutral[600],
    fontFamily: 'Inter-Medium',
  },
  activeFilterTabText: {
    color: Colors.white,
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
    paddingHorizontal: 32,
  },
});