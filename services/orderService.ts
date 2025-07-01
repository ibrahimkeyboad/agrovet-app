import { supabase } from '@/lib/supabase';
import { Order, OrderItem, ShippingAddress, PaymentMethod, ShippingMethod, OrderStatusHistory } from '@/types/ecommerce';

// Database types
interface OrderDB {
  id: string;
  order_number: string;
  status: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  subtotal: number;
  tax: number;
  shipping_cost: number;
  discount_amount: number;
  total: number;
  shipping_address: any;
  payment_method: any;
  shipping_method: any;
  discount_code?: string;
  tracking_number?: string;
  estimated_delivery?: string;
  notes?: string;
  priority?: string;
  created_at: string;
  updated_at: string;
}

interface OrderItemDB {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_image_url: string;
  product_sku: string;
  supplier: string;
  unit_price: number;
  quantity: number;
  subtotal: number;
  selected_variants?: any;
  selected_options?: any;
  created_at: string;
}

interface OrderStatusHistoryDB {
  id: string;
  order_id: string;
  status: string;
  timestamp: string;
  note?: string;
  created_by?: string;
}

// Transform database order to app order format
const transformOrder = (dbOrder: OrderDB, items: OrderItemDB[] = [], statusHistory: OrderStatusHistoryDB[] = []): Order => {
  return {
    id: dbOrder.id,
    orderNumber: dbOrder.order_number,
    status: dbOrder.status as Order['status'],
    items: items.map(item => ({
      id: item.id,
      productId: item.product_id,
      name: item.product_name,
      imageUrl: item.product_image_url,
      price: item.unit_price,
      quantity: item.quantity,
      supplier: item.supplier,
      selectedVariants: item.selected_variants,
      selectedOptions: item.selected_options,
      subtotal: item.subtotal,
    })),
    subtotal: dbOrder.subtotal,
    tax: dbOrder.tax,
    shippingCost: dbOrder.shipping_cost,
    discountAmount: dbOrder.discount_amount,
    total: dbOrder.total,
    shippingAddress: dbOrder.shipping_address,
    paymentMethod: dbOrder.payment_method,
    shippingMethod: dbOrder.shipping_method,
    discountCode: dbOrder.discount_code,
    createdAt: dbOrder.created_at,
    updatedAt: dbOrder.updated_at,
    estimatedDelivery: dbOrder.estimated_delivery,
    trackingNumber: dbOrder.tracking_number,
    notes: dbOrder.notes,
    statusHistory: statusHistory.map(history => ({
      status: history.status as Order['status'],
      timestamp: history.timestamp,
      note: history.note,
    })),
    customerName: dbOrder.customer_name,
    customerEmail: dbOrder.customer_email,
    customerPhone: dbOrder.customer_phone,
    priority: dbOrder.priority as Order['priority'],
  };
};

export class OrderService {
  // Create a new order
  static async createOrder(
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
  ): Promise<Order> {
    try {
      // Generate order number
      const { data: orderNumberData, error: orderNumberError } = await supabase
        .rpc('generate_order_number');

      if (orderNumberError) {
        throw orderNumberError;
      }

      const orderNumber = orderNumberData;

      // Generate customer info
      const customerName = `${shippingAddress.firstName} ${shippingAddress.lastName}`;
      const customerEmail = `${shippingAddress.firstName.toLowerCase()}.${shippingAddress.lastName.toLowerCase()}@email.com`;
      const customerPhone = shippingAddress.phone;

      // Calculate estimated delivery
      const estimatedDays = parseInt(shippingMethod.estimatedDays.split('-')[1] || shippingMethod.estimatedDays.split(' ')[0]);
      const estimatedDelivery = new Date();
      estimatedDelivery.setDate(estimatedDelivery.getDate() + estimatedDays);

      // Create order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          status: 'pending',
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
          subtotal: summary.subtotal,
          tax: summary.tax,
          shipping_cost: summary.shippingCost,
          discount_amount: summary.discountAmount,
          total: summary.total,
          shipping_address: shippingAddress,
          payment_method: paymentMethod,
          shipping_method: shippingMethod,
          discount_code: discountCode,
          estimated_delivery: estimatedDelivery.toISOString(),
          tracking_number: `TRK${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
          priority: 'normal',
        })
        .select()
        .single();

      if (orderError) {
        throw orderError;
      }

      // Create order items
      const orderItems = items.map(item => ({
        order_id: orderData.id,
        product_id: item.productId,
        product_name: item.name,
        product_image_url: item.imageUrl,
        product_sku: item.productId, // Using productId as SKU for now
        supplier: item.supplier,
        unit_price: item.price,
        quantity: item.quantity,
        subtotal: item.subtotal,
        selected_variants: item.selectedVariants || {},
        selected_options: item.selectedOptions || {},
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        throw itemsError;
      }

      // Add initial status history
      const { error: historyError } = await supabase
        .from('order_status_history')
        .insert({
          order_id: orderData.id,
          status: 'pending',
          note: 'Order placed successfully',
          created_by: 'system',
        });

      if (historyError) {
        console.warn('Failed to add status history:', historyError);
      }

      // Fetch the complete order with items and history
      return await this.getOrderById(orderData.id);
    } catch (error) {
      console.error('Failed to create order:', error);
      throw error;
    }
  }

  // Get order by ID
  static async getOrderById(id: string): Promise<Order> {
    try {
      // Fetch order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single();

      if (orderError) {
        throw orderError;
      }

      // Fetch order items
      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', id)
        .order('created_at');

      if (itemsError) {
        throw itemsError;
      }

      // Fetch status history
      const { data: historyData, error: historyError } = await supabase
        .from('order_status_history')
        .select('*')
        .eq('order_id', id)
        .order('timestamp');

      if (historyError) {
        console.warn('Failed to fetch status history:', historyError);
      }

      return transformOrder(orderData, itemsData || [], historyData || []);
    } catch (error) {
      console.error('Failed to fetch order:', error);
      throw error;
    }
  }

  // Get all orders (for admin)
  static async getAllOrders(): Promise<Order[]> {
    try {
      // Fetch orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersError) {
        throw ordersError;
      }

      // Fetch all order items
      const orderIds = ordersData.map(order => order.id);
      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .in('order_id', orderIds);

      if (itemsError) {
        throw itemsError;
      }

      // Fetch all status history
      const { data: historyData, error: historyError } = await supabase
        .from('order_status_history')
        .select('*')
        .in('order_id', orderIds)
        .order('timestamp');

      if (historyError) {
        console.warn('Failed to fetch status history:', historyError);
      }

      // Group items and history by order ID
      const itemsByOrder = itemsData?.reduce((acc, item) => {
        if (!acc[item.order_id]) acc[item.order_id] = [];
        acc[item.order_id].push(item);
        return acc;
      }, {} as Record<string, OrderItemDB[]>) || {};

      const historyByOrder = historyData?.reduce((acc, history) => {
        if (!acc[history.order_id]) acc[history.order_id] = [];
        acc[history.order_id].push(history);
        return acc;
      }, {} as Record<string, OrderStatusHistoryDB[]>) || {};

      return ordersData.map(order => 
        transformOrder(order, itemsByOrder[order.id] || [], historyByOrder[order.id] || [])
      );
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      throw error;
    }
  }

  // Update order status
  static async updateOrderStatus(orderId: string, status: Order['status'], note?: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (error) {
        throw error;
      }

      // Add status history entry
      const { error: historyError } = await supabase
        .from('order_status_history')
        .insert({
          order_id: orderId,
          status,
          note: note || `Order status updated to ${status}`,
          created_by: 'admin',
        });

      if (historyError) {
        console.warn('Failed to add status history:', historyError);
      }
    } catch (error) {
      console.error('Failed to update order status:', error);
      throw error;
    }
  }

  // Delete order
  static async deleteOrder(orderId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Failed to delete order:', error);
      throw error;
    }
  }

  // Get orders by status
  static async getOrdersByStatus(status: Order['status']): Promise<Order[]> {
    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (ordersError) {
        throw ordersError;
      }

      // Fetch items for these orders
      const orderIds = ordersData.map(order => order.id);
      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .in('order_id', orderIds);

      if (itemsError) {
        throw itemsError;
      }

      // Group items by order ID
      const itemsByOrder = itemsData?.reduce((acc, item) => {
        if (!acc[item.order_id]) acc[item.order_id] = [];
        acc[item.order_id].push(item);
        return acc;
      }, {} as Record<string, OrderItemDB[]>) || {};

      return ordersData.map(order => 
        transformOrder(order, itemsByOrder[order.id] || [])
      );
    } catch (error) {
      console.error('Failed to fetch orders by status:', error);
      throw error;
    }
  }
}