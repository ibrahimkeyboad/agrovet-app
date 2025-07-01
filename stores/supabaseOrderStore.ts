import { create } from 'zustand';
import { Order, OrderItem, ShippingAddress, PaymentMethod, ShippingMethod } from '@/types/ecommerce';
import { OrderService } from '@/services/orderService';

interface SupabaseOrderStore {
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
  fetchOrders: () => Promise<void>;
  updateOrderStatus: (orderId: string, status: Order['status'], note?: string) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
  getOrder: (orderId: string) => Order | undefined;
  getOrdersByStatus: (status: Order['status']) => Order[];
  getAllOrders: () => Order[];
  clearOrders: () => void;
}

export const useSupabaseOrderStore = create<SupabaseOrderStore>((set, get) => ({
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
      const newOrder = await OrderService.createOrder(
        items,
        shippingAddress,
        paymentMethod,
        shippingMethod,
        summary,
        discountCode
      );

      // Add order to the beginning of the array (most recent first)
      set((state) => ({
        orders: [newOrder, ...state.orders],
        currentOrder: newOrder,
        isLoading: false,
      }));

      console.log('Order created successfully:', newOrder);
      return newOrder;
    } catch (error) {
      console.error('Failed to create order:', error);
      set({ error: 'Failed to create order', isLoading: false });
      throw error;
    }
  },

  fetchOrders: async () => {
    set({ isLoading: true, error: undefined });

    try {
      const orders = await OrderService.getAllOrders();
      set({ orders, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      set({ error: 'Failed to fetch orders', isLoading: false });
    }
  },

  updateOrderStatus: async (orderId, status, note) => {
    set({ isLoading: true, error: undefined });

    try {
      await OrderService.updateOrderStatus(orderId, status, note);
      
      // Update the order in the local state
      set((state) => ({
        orders: state.orders.map(order =>
          order.id === orderId
            ? {
                ...order,
                status,
                updatedAt: new Date().toISOString(),
                statusHistory: [
                  ...(order.statusHistory || []),
                  {
                    status,
                    timestamp: new Date().toISOString(),
                    note: note || `Order status updated to ${status}`,
                  },
                ],
              }
            : order
        ),
        isLoading: false,
      }));

      console.log(`Order ${orderId} status updated to ${status}`);
    } catch (error) {
      console.error('Failed to update order status:', error);
      set({ error: 'Failed to update order status', isLoading: false });
      throw error;
    }
  },

  deleteOrder: async (orderId) => {
    set({ isLoading: true, error: undefined });

    try {
      await OrderService.deleteOrder(orderId);
      
      // Remove order from local state
      set((state) => ({
        orders: state.orders.filter(order => order.id !== orderId),
        isLoading: false,
      }));

      console.log(`Order ${orderId} deleted`);
    } catch (error) {
      console.error('Failed to delete order:', error);
      set({ error: 'Failed to delete order', isLoading: false });
      throw error;
    }
  },

  getOrder: (orderId) => {
    return get().orders.find(order => order.id === orderId);
  },

  getOrdersByStatus: (status) => {
    return get().orders.filter(order => order.status === status);
  },

  getAllOrders: () => {
    return get().orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  clearOrders: () => {
    set({ orders: [], currentOrder: undefined });
  },
}));