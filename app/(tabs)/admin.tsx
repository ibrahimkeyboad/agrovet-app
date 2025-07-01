import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Modal,
  Alert,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Package, Search, Filter, MoveVertical as MoreVertical, Eye, CreditCard as Edit3, Trash2, CircleCheck as CheckCircle, Clock, Truck, X, CircleAlert as AlertCircle, Calendar, DollarSign, User, MapPin, Phone, Mail } from 'lucide-react-native';

import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';
import Card from '@/components/common/Card';
import SearchBar from '@/components/common/SearchBar';
import Button from '@/components/common/Button';
import { formatCurrency } from '@/utils/currency';
import { useSupabaseOrders } from '@/hooks/useSupabaseOrders';

export default function AdminScreen() {
  const { 
    orders, 
    isLoading,
    error,
    updateOrderStatus,
    deleteOrder: removeOrder,
    refetch,
  } = useSupabaseOrders();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [actionModalVisible, setActionModalVisible] = useState(false);

  useEffect(() => {
    console.log('Admin screen mounted, total orders:', orders.length);
  }, [orders.length]);

  const statusFilters = [
    { id: 'all', label: 'All Orders', count: orders.length },
    { id: 'pending', label: 'Pending', count: orders.filter(o => o.status === 'pending').length },
    { id: 'confirmed', label: 'Confirmed', count: orders.filter(o => o.status === 'confirmed').length },
    { id: 'processing', label: 'Processing', count: orders.filter(o => o.status === 'processing').length },
    { id: 'shipped', label: 'Shipped', count: orders.filter(o => o.status === 'shipped').length },
    { id: 'delivered', label: 'Delivered', count: orders.filter(o => o.status === 'delivered').length },
  ];

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.customerName && order.customerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (order.customerEmail && order.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
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

  const getStatusIcon = (status) => {
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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return Colors.error[500];
      case 'normal':
        return Colors.primary[500];
      case 'low':
        return Colors.neutral[500];
      default:
        return Colors.neutral[500];
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      setActionModalVisible(false);
      Alert.alert('Success', `Order status updated to ${newStatus}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to update order status');
    }
  };

  const handleDeleteOrder = (orderId) => {
    Alert.alert(
      'Delete Order',
      'Are you sure you want to delete this order? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeOrder(orderId);
              setActionModalVisible(false);
              Alert.alert('Success', 'Order deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete order');
            }
          },
        },
      ]
    );
  };

  const renderStatusFilters = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.filtersContainer}
      contentContainerStyle={styles.filtersContent}
    >
      {statusFilters.map((filter) => (
        <TouchableOpacity
          key={filter.id}
          style={[
            styles.filterChip,
            statusFilter === filter.id && styles.activeFilterChip,
          ]}
          onPress={() => setStatusFilter(filter.id)}
        >
          <Text
            style={[
              styles.filterChipText,
              statusFilter === filter.id && styles.activeFilterChipText,
            ]}
          >
            {filter.label}
          </Text>
          <View style={[
            styles.filterCount,
            statusFilter === filter.id && styles.activeFilterCount,
          ]}>
            <Text style={[
              styles.filterCountText,
              statusFilter === filter.id && styles.activeFilterCountText,
            ]}>
              {filter.count}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderOrderCard = ({ item }) => (
    <Card style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View style={styles.orderInfo}>
          <View style={styles.orderNumberRow}>
            <Text style={styles.orderNumber}>#{item.orderNumber}</Text>
            <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(item.priority || 'normal') }]} />
          </View>
          <Text style={styles.customerName}>
            {item.customerName || `Customer ${item.orderNumber.slice(-3)}`}
          </Text>
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
        
        <View style={styles.orderActions}>
          <View style={styles.statusContainer}>
            {getStatusIcon(item.status)}
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.moreButton}
            onPress={() => {
              setSelectedOrder(item);
              setActionModalVisible(true);
            }}
          >
            <MoreVertical size={20} color={Colors.neutral[600]} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.orderItems}>
        <Text style={styles.itemsTitle}>Items ({item.items.length})</Text>
        {item.items.slice(0, 2).map((orderItem) => (
          <View key={orderItem.id} style={styles.orderItemRow}>
            <Image source={{ uri: orderItem.imageUrl }} style={styles.itemImage} />
            <View style={styles.itemDetails}>
              <Text style={styles.itemName} numberOfLines={1}>
                {orderItem.name}
              </Text>
              <Text style={styles.itemSupplier}>{orderItem.supplier}</Text>
              <Text style={styles.itemQuantity}>Qty: {orderItem.quantity}</Text>
            </View>
            <Text style={styles.itemPrice}>{formatCurrency(orderItem.price)}</Text>
          </View>
        ))}
        {item.items.length > 2 && (
          <Text style={styles.moreItems}>+{item.items.length - 2} more items</Text>
        )}
      </View>

      <View style={styles.orderFooter}>
        <View style={styles.orderTotal}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalAmount}>{formatCurrency(item.total)}</Text>
        </View>
        <View style={styles.orderFooterActions}>
          <TouchableOpacity
            style={styles.viewButton}
            onPress={() => {
              setSelectedOrder(item);
              setDetailsModalVisible(true);
            }}
          >
            <Eye size={16} color={Colors.primary[700]} />
            <Text style={styles.viewButtonText}>View Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );

  const renderDetailsModal = () => (
    <Modal
      visible={detailsModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setDetailsModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Order Details</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setDetailsModalVisible(false)}
            >
              <X size={24} color={Colors.neutral[800]} />
            </TouchableOpacity>
          </View>

          {selectedOrder && (
            <ScrollView style={styles.modalBody}>
              {/* Order Info */}
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Order Information</Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Order Number:</Text>
                  <Text style={styles.detailValue}>#{selectedOrder.orderNumber}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Date:</Text>
                  <Text style={styles.detailValue}>
                    {new Date(selectedOrder.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Status:</Text>
                  <View style={styles.statusContainer}>
                    {getStatusIcon(selectedOrder.status)}
                    <Text style={[styles.statusText, { color: getStatusColor(selectedOrder.status) }]}>
                      {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                    </Text>
                  </View>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Payment:</Text>
                  <Text style={styles.detailValue}>{selectedOrder.paymentMethod.provider}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Total:</Text>
                  <Text style={styles.detailValue}>{formatCurrency(selectedOrder.total)}</Text>
                </View>
              </View>

              {/* Customer Info */}
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Customer Information</Text>
                <View style={styles.detailRow}>
                  <User size={16} color={Colors.neutral[600]} />
                  <Text style={styles.detailValue}>
                    {selectedOrder.customerName || `Customer ${selectedOrder.orderNumber.slice(-3)}`}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Mail size={16} color={Colors.neutral[600]} />
                  <Text style={styles.detailValue}>
                    {selectedOrder.customerEmail || `customer${selectedOrder.orderNumber.slice(-3)}@email.com`}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Phone size={16} color={Colors.neutral[600]} />
                  <Text style={styles.detailValue}>
                    {selectedOrder.customerPhone || '+255 712 345 678'}
                  </Text>
                </View>
              </View>

              {/* Shipping Address */}
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Shipping Address</Text>
                <View style={styles.addressContainer}>
                  <MapPin size={16} color={Colors.neutral[600]} />
                  <View style={styles.addressText}>
                    <Text style={styles.detailValue}>{selectedOrder.shippingAddress.address}</Text>
                    <Text style={styles.detailValue}>
                      {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.region}
                    </Text>
                    <Text style={styles.detailValue}>{selectedOrder.shippingAddress.postalCode}</Text>
                  </View>
                </View>
              </View>

              {/* Order Items */}
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Order Items</Text>
                {selectedOrder.items.map((item) => (
                  <View key={item.id} style={styles.detailItemRow}>
                    <Image source={{ uri: item.imageUrl }} style={styles.detailItemImage} />
                    <View style={styles.detailItemInfo}>
                      <Text style={styles.detailItemName}>{item.name}</Text>
                      <Text style={styles.detailItemSupplier}>{item.supplier}</Text>
                      <Text style={styles.detailItemQuantity}>Quantity: {item.quantity}</Text>
                    </View>
                    <Text style={styles.detailItemPrice}>{formatCurrency(item.price)}</Text>
                  </View>
                ))}
              </View>

              {/* Status History */}
              {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Status History</Text>
                  {selectedOrder.statusHistory.map((history, index) => (
                    <View key={index} style={styles.historyItem}>
                      <View style={styles.historyIcon}>
                        {getStatusIcon(history.status)}
                      </View>
                      <View style={styles.historyContent}>
                        <Text style={styles.historyStatus}>
                          {history.status.charAt(0).toUpperCase() + history.status.slice(1)}
                        </Text>
                        <Text style={styles.historyDate}>
                          {new Date(history.timestamp).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Text>
                        {history.note && (
                          <Text style={styles.historyNote}>{history.note}</Text>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );

  const renderActionModal = () => (
    <Modal
      visible={actionModalVisible}
      animationType="fade"
      transparent={true}
      onRequestClose={() => setActionModalVisible(false)}
    >
      <View style={styles.actionModalOverlay}>
        <View style={styles.actionModalContent}>
          <Text style={styles.actionModalTitle}>Order Actions</Text>
          <Text style={styles.actionModalSubtitle}>
            {selectedOrder?.orderNumber} - {selectedOrder?.customerName || `Customer ${selectedOrder?.orderNumber.slice(-3)}`}
          </Text>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                setActionModalVisible(false);
                setDetailsModalVisible(true);
              }}
            >
              <Eye size={20} color={Colors.primary[700]} />
              <Text style={styles.actionButtonText}>View Details</Text>
            </TouchableOpacity>

            {selectedOrder?.status === 'pending' && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleUpdateOrderStatus(selectedOrder.id, 'confirmed')}
              >
                <CheckCircle size={20} color={Colors.success[600]} />
                <Text style={styles.actionButtonText}>Confirm Order</Text>
              </TouchableOpacity>
            )}

            {selectedOrder?.status === 'confirmed' && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleUpdateOrderStatus(selectedOrder.id, 'processing')}
              >
                <Package size={20} color={Colors.primary[600]} />
                <Text style={styles.actionButtonText}>Start Processing</Text>
              </TouchableOpacity>
            )}

            {selectedOrder?.status === 'processing' && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleUpdateOrderStatus(selectedOrder.id, 'shipped')}
              >
                <Truck size={20} color={Colors.secondary[600]} />
                <Text style={styles.actionButtonText}>Mark as Shipped</Text>
              </TouchableOpacity>
            )}

            {selectedOrder?.status === 'shipped' && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleUpdateOrderStatus(selectedOrder.id, 'delivered')}
              >
                <CheckCircle size={20} color={Colors.success[600]} />
                <Text style={styles.actionButtonText}>Mark as Delivered</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => handleDeleteOrder(selectedOrder?.id)}
            >
              <Trash2 size={20} color={Colors.error[600]} />
              <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete Order</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setActionModalVisible(false)}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Admin Dashboard</Text>
        <View style={styles.headerStats}>
          <Text style={styles.statsText}>{filteredOrders.length} orders</Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search orders, customers..."
          onClear={() => setSearchQuery('')}
        />
      </View>

      {renderStatusFilters()}

      {isLoading && orders.length === 0 ? (
        renderLoadingState()
      ) : error ? (
        renderErrorState()
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.id}
          renderItem={renderOrderCard}
          contentContainerStyle={[
            styles.ordersList,
            filteredOrders.length === 0 && styles.emptyList,
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={refetch}
              colors={[Colors.primary[700]]}
              tintColor={Colors.primary[700]}
            />
          }
          ListEmptyComponent={() => (
            <View style={styles.emptyState}>
              <Package size={64} color={Colors.neutral[400]} />
              <Text style={styles.emptyStateTitle}>No Orders Found</Text>
              <Text style={styles.emptyStateText}>
                {searchQuery 
                  ? 'No orders match your search criteria'
                  : 'No orders available for the selected filter'
                }
              </Text>
            </View>
          )}
        />
      )}

      {renderDetailsModal()}
      {renderActionModal()}
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
  headerStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsText: {
    ...Typography.body,
    color: Colors.neutral[600],
  },
  searchContainer: {
    backgroundColor: Colors.white,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
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
  filtersContainer: {
    backgroundColor: Colors.white,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  filtersContent: {
    paddingHorizontal: 16,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: Colors.neutral[100],
  },
  activeFilterChip: {
    backgroundColor: Colors.primary[700],
  },
  filterChipText: {
    ...Typography.bodySmall,
    color: Colors.neutral[600],
    fontFamily: 'Inter-Medium',
    marginRight: 6,
  },
  activeFilterChipText: {
    color: Colors.white,
  },
  filterCount: {
    backgroundColor: Colors.neutral[200],
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  activeFilterCount: {
    backgroundColor: Colors.white,
  },
  filterCountText: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    color: Colors.neutral[600],
  },
  activeFilterCountText: {
    color: Colors.primary[700],
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
  orderInfo: {
    flex: 1,
  },
  orderNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  orderNumber: {
    ...Typography.h5,
    marginRight: 8,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  customerName: {
    ...Typography.body,
    fontFamily: 'Inter-Medium',
    marginBottom:  2,
  },
  orderDate: {
    ...Typography.caption,
    color: Colors.neutral[600],
  },
  orderActions: {
    alignItems: 'flex-end',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral[100],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  statusText: {
    ...Typography.caption,
    fontFamily: 'Inter-Medium',
    marginLeft: 4,
  },
  moreButton: {
    padding: 4,
  },
  orderItems: {
    marginBottom: 16,
  },
  itemsTitle: {
    ...Typography.body,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
  },
  orderItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemImage: {
    width: 40,
    height: 40,
    borderRadius: 6,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    ...Typography.bodySmall,
    fontFamily: 'Inter-Medium',
    marginBottom: 2,
  },
  itemSupplier: {
    ...Typography.caption,
    color: Colors.primary[700],
    marginBottom: 1,
  },
  itemQuantity: {
    ...Typography.caption,
    color: Colors.neutral[600],
  },
  itemPrice: {
    ...Typography.bodySmall,
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
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[200],
  },
  orderTotal: {
    flex: 1,
  },
  totalLabel: {
    ...Typography.caption,
    color: Colors.neutral[600],
  },
  totalAmount: {
    ...Typography.h5,
    color: Colors.primary[700],
  },
  orderFooterActions: {
    flexDirection: 'row',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: Colors.primary[50],
    borderRadius: 6,
  },
  viewButtonText: {
    ...Typography.bodySmall,
    color: Colors.primary[700],
    fontFamily: 'Inter-Medium',
    marginLeft: 4,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  modalTitle: {
    ...Typography.h4,
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
  modalBody: {
    padding: 24,
  },
  detailSection: {
    marginBottom: 24,
  },
  detailSectionTitle: {
    ...Typography.h5,
    marginBottom: 12,
    color: Colors.neutral[900],
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    minHeight: 24,
  },
  detailLabel: {
    ...Typography.body,
    color: Colors.neutral[600],
    width: 100,
    marginRight: 12,
  },
  detailValue: {
    ...Typography.body,
    fontFamily: 'Inter-Medium',
    flex: 1,
    marginLeft: 8,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  addressText: {
    marginLeft: 8,
    flex: 1,
  },
  detailItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  detailItemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  detailItemInfo: {
    flex: 1,
  },
  detailItemName: {
    ...Typography.body,
    fontFamily: 'Inter-Medium',
    marginBottom: 2,
  },
  detailItemSupplier: {
    ...Typography.caption,
    color: Colors.primary[700],
    marginBottom: 2,
  },
  detailItemQuantity: {
    ...Typography.caption,
    color: Colors.neutral[600],
  },
  detailItemPrice: {
    ...Typography.body,
    fontFamily: 'Inter-SemiBold',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  historyIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  historyContent: {
    flex: 1,
  },
  historyStatus: {
    ...Typography.body,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  historyDate: {
    ...Typography.caption,
    color: Colors.neutral[600],
    marginBottom: 2,
  },
  historyNote: {
    ...Typography.bodySmall,
    color: Colors.neutral[700],
    fontStyle: 'italic',
  },
  actionModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  actionModalContent: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  actionModalTitle: {
    ...Typography.h4,
    textAlign: 'center',
    marginBottom: 8,
  },
  actionModalSubtitle: {
    ...Typography.body,
    color: Colors.neutral[600],
    textAlign: 'center',
    marginBottom: 24,
  },
  actionButtons: {
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: Colors.neutral[50],
  },
  actionButtonText: {
    ...Typography.body,
    fontFamily: 'Inter-Medium',
    marginLeft: 12,
  },
  deleteButton: {
    backgroundColor: Colors.error[50],
  },
  deleteButtonText: {
    color: Colors.error[600],
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    ...Typography.body,
    color: Colors.neutral[600],
  },
});