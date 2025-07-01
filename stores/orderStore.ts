import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Order, OrderItem, ShippingAddress, PaymentMethod, ShippingMethod, OrderStatusHistory } from '@/types/ecommerce';
import { useCartStore } from './cartStore';

interface OrderStore {
  orders: Order[];
  currentOrder?: Order;
  isLoading: boolean;
  error?: string;

  // Actions
  createOrder: (
    items: OrderItem[],
    shippingAddress: ShippingAddress,
    paymentMethod: PaymentMethod,
    shippingMethod: ShippingMethod,
    summary: {
      subtotal: number;
      tax: number;
      shippingCost: number;
      discountAmount: number;
      total: number;
    },
    discountCode?: string
  ) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  cancelOrder: (orderId: string) => Promise<boolean>;
  getOrder: (orderId: string) => Order | undefined;
  getOrdersByStatus: (status: Order['status']) => Order[];
  getRecentOrders: (limit?: number) => Order[];
  clearOrders: () => void;
  generateOrderNumber: () => string;
  generateTrackingNumber: () => string;
  // Admin functions
  getAllOrders: () => Order[];
  updateOrderWithTimestamp: (orderId: string, status: Order['status']) => void;
  deleteOrder: (orderId: string) => void;
}

export const useOrderStore = create<OrderStore>()(
  persist(
    (set, get) => ({
      orders: [],
      currentOrder: undefined,
      isLoading: false,
      error: undefined,

      createOrder: async (
        items,
        shippingAddress,
        paymentMethod,
        shippingMethod,
        summary,
        discountCode
      ) => {
        set({ isLoading: true, error: undefined });

        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));

          const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          const orderNumber = get().generateOrderNumber();
          const now = new Date().toISOString();

          // Calculate estimated delivery
          const estimatedDays = parseInt(shippingMethod.estimatedDays.split('-')[1] || shippingMethod.estimatedDays.split(' ')[0]);
          const estimatedDelivery = new Date();
          estimatedDelivery.setDate(estimatedDelivery.getDate() + estimatedDays);

          // Generate customer info based on shipping address
          const customerName = `${shippingAddress.firstName} ${shippingAddress.lastName}`;
          const customerEmail = `${shippingAddress.firstName.toLowerCase()}.${shippingAddress.lastName.toLowerCase()}@email.com`;
          const customerPhone = shippingAddress.phone;

          const newOrder: Order = {
            id: orderId,
            orderNumber,
            status: 'pending', // Always start with pending status
            items,
            subtotal: summary.subtotal,
            tax: summary.tax,
            shippingCost: summary.shippingCost,
            discountAmount: summary.discountAmount,
            total: summary.total,
            shippingAddress,
            paymentMethod,
            shippingMethod,
            discountCode,
            createdAt: now,
            updatedAt: now,
            estimatedDelivery: estimatedDelivery.toISOString(),
            trackingNumber: get().generateTrackingNumber(),
            // Add customer info for admin
            customerName,
            customerEmail,
            customerPhone,
            priority: 'normal',
            // Add status history for tracking
            statusHistory: [
              {
                status: 'pending',
                timestamp: now,
                note: 'Order placed successfully',
              },
            ],
          };

          // Add order to the beginning of the array (most recent first)
          set((state) => ({
            orders: [newOrder, ...state.orders],
            currentOrder: newOrder,
            isLoading: false,
          }));

          // Clear cart after successful order
          useCartStore.getState().clearCart();

          console.log('Order created successfully:', newOrder);
          return newOrder;
        } catch (error) {
          console.error('Failed to create order:', error);
          set({ error: 'Failed to create order', isLoading: false });
          throw error;
        }
      },

      updateOrderStatus: (orderId, status) => {
        const now = new Date().toISOString();
        set((state) => ({
          orders: state.orders.map(order =>
            order.id === orderId
              ? { 
                  ...order, 
                  status, 
                  updatedAt: now,
                  statusHistory: [
                    ...(order.statusHistory || []),
                    {
                      status,
                      timestamp: now,
                      note: `Order status updated to ${status}`,
                    },
                  ],
                }
              : order
          ),
        }));
        console.log(`Order ${orderId} status updated to ${status}`);
      },

      updateOrderWithTimestamp: (orderId, status) => {
        // This is specifically for admin updates with current timestamp
        get().updateOrderStatus(orderId, status);
      },

      cancelOrder: async (orderId) => {
        set({ isLoading: true, error: undefined });

        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));

          const order = get().getOrder(orderId);
          if (!order) {
            throw new Error('Order not found');
          }

          if (!['pending', 'confirmed'].includes(order.status)) {
            throw new Error('Order cannot be cancelled');
          }

          get().updateOrderStatus(orderId, 'cancelled');
          set({ isLoading: false });
          return true;
        } catch (error) {
          set({ error: 'Failed to cancel order', isLoading: false });
          return false;
        }
      },

      getOrder: (orderId) => {
        return get().orders.find(order => order.id === orderId);
      },

      getOrdersByStatus: (status) => {
        return get().orders.filter(order => order.status === status);
      },

      getRecentOrders: (limit = 10) => {
        return get().orders
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, limit);
      },

      getAllOrders: () => {
        return get().orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      },

      deleteOrder: (orderId) => {
        set((state) => ({
          orders: state.orders.filter(order => order.id !== orderId),
        }));
        console.log(`Order ${orderId} deleted`);
      },

      clearOrders: () => {
        set({ orders: [], currentOrder: undefined });
      },

      generateOrderNumber: () => {
        const prefix = 'AG';
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.random().toString(36).substr(2, 3).toUpperCase();
        return `${prefix}${timestamp}${random}`;
      },

      generateTrackingNumber: () => {
        const prefix = 'TRK';
        const timestamp = Date.now().toString();
        const random = Math.random().toString(36).substr(2, 6).toUpperCase();
        return `${prefix}${timestamp}${random}`;
      },
    }),
    {
      name: 'agrilink-orders',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        orders: state.orders,
      }),
      onRehydrateStorage: () => (state) => {
        console.log('Orders rehydrated:', state?.orders?.length || 0, 'orders');
      },
    }
  )
);