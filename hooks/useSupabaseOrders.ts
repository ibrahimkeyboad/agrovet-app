import { useState, useEffect } from 'react';
import { Order } from '@/types/ecommerce';
import { OrderService } from '@/services/orderService';

export function useSupabaseOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all orders
  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const ordersData = await OrderService.getAllOrders();
      setOrders(ordersData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
      console.error('Error fetching orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Get order by ID
  const getOrder = (orderId: string): Order | undefined => {
    return orders.find(order => order.id === orderId);
  };

  // Get orders by status
  const getOrdersByStatus = (status: Order['status']): Order[] => {
    return orders.filter(order => order.status === status);
  };

  // Update order status
  const updateOrderStatus = async (orderId: string, status: Order['status'], note?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await OrderService.updateOrderStatus(orderId, status, note);
      await fetchOrders(); // Refresh orders
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update order status');
      console.error('Error updating order status:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete order
  const deleteOrder = async (orderId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await OrderService.deleteOrder(orderId);
      await fetchOrders(); // Refresh orders
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete order');
      console.error('Error deleting order:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Get recent orders
  const getRecentOrders = (limit: number = 10): Order[] => {
    return orders
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  };

  // Load orders on mount
  useEffect(() => {
    fetchOrders();
  }, []);

  return {
    orders,
    isLoading,
    error,
    fetchOrders,
    getOrder,
    getOrdersByStatus,
    updateOrderStatus,
    deleteOrder,
    getRecentOrders,
    refetch: fetchOrders,
  };
}