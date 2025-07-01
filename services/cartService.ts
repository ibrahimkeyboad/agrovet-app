import { supabase } from '@/lib/supabase';
import { CartItem } from '@/types/ecommerce';
import { Product } from '@/types/product';

// Database types
interface CartItemDB {
  id: string;
  user_id?: string;
  session_id?: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  selected_variants?: any;
  selected_options?: any;
  created_at: string;
  updated_at: string;
  // Joined product data
  products?: {
    name: string;
    img: string;
    brand: string;
    sku: string;
  };
}

// Transform database cart item to app cart item format
const transformCartItem = (dbItem: CartItemDB): CartItem => {
  return {
    id: dbItem.id,
    productId: dbItem.product_id,
    name: dbItem.products?.name || 'Unknown Product',
    imageUrl: dbItem.products?.img || '',
    price: dbItem.unit_price,
    quantity: dbItem.quantity,
    supplier: dbItem.products?.brand || 'Unknown Supplier',
    selectedVariants: dbItem.selected_variants,
    selectedOptions: dbItem.selected_options,
    subtotal: dbItem.subtotal,
  };
};

export class CartService {
  // Get session ID for guest users
  private static getSessionId(): string {
    if (typeof window !== 'undefined') {
      let sessionId = localStorage.getItem('cart_session_id');
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('cart_session_id', sessionId);
      }
      return sessionId;
    }
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get cart items
  static async getCartItems(userId?: string): Promise<CartItem[]> {
    try {
      let query = supabase
        .from('cart_items')
        .select(`
          *,
          products (
            name,
            img,
            brand,
            sku
          )
        `)
        .order('created_at');

      if (userId) {
        query = query.eq('user_id', userId);
      } else {
        const sessionId = this.getSessionId();
        query = query.eq('session_id', sessionId);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data?.map(transformCartItem) || [];
    } catch (error) {
      console.error('Failed to fetch cart items:', error);
      throw error;
    }
  }

  // Add item to cart
  static async addToCart(
    product: Product,
    quantity: number = 1,
    variants?: { [key: string]: string },
    options?: { [key: string]: string },
    userId?: string
  ): Promise<CartItem> {
    try {
      const sessionId = userId ? undefined : this.getSessionId();
      const unitPrice = product.price.amount;
      const subtotal = unitPrice * quantity;

      // Check if item already exists in cart
      let existingQuery = supabase
        .from('cart_items')
        .select('*')
        .eq('product_id', product.id);

      if (userId) {
        existingQuery = existingQuery.eq('user_id', userId);
      } else {
        existingQuery = existingQuery.eq('session_id', sessionId);
      }

      // Add variant/option matching if provided
      if (variants && Object.keys(variants).length > 0) {
        existingQuery = existingQuery.eq('selected_variants', JSON.stringify(variants));
      }
      if (options && Object.keys(options).length > 0) {
        existingQuery = existingQuery.eq('selected_options', JSON.stringify(options));
      }

      const { data: existingItems, error: existingError } = await existingQuery;

      if (existingError) {
        throw existingError;
      }

      if (existingItems && existingItems.length > 0) {
        // Update existing item
        const existingItem = existingItems[0];
        const newQuantity = existingItem.quantity + quantity;
        const newSubtotal = unitPrice * newQuantity;

        const { data, error } = await supabase
          .from('cart_items')
          .update({
            quantity: newQuantity,
            subtotal: newSubtotal,
          })
          .eq('id', existingItem.id)
          .select(`
            *,
            products (
              name,
              img,
              brand,
              sku
            )
          `)
          .single();

        if (error) {
          throw error;
        }

        return transformCartItem(data);
      } else {
        // Create new item
        const { data, error } = await supabase
          .from('cart_items')
          .insert({
            user_id: userId,
            session_id: sessionId,
            product_id: product.id,
            quantity,
            unit_price: unitPrice,
            subtotal,
            selected_variants: variants || {},
            selected_options: options || {},
          })
          .select(`
            *,
            products (
              name,
              img,
              brand,
              sku
            )
          `)
          .single();

        if (error) {
          throw error;
        }

        return transformCartItem(data);
      }
    } catch (error) {
      console.error('Failed to add item to cart:', error);
      throw error;
    }
  }

  // Update cart item quantity
  static async updateCartItemQuantity(itemId: string, quantity: number): Promise<void> {
    try {
      if (quantity <= 0) {
        await this.removeFromCart(itemId);
        return;
      }

      // Get current item to calculate new subtotal
      const { data: currentItem, error: fetchError } = await supabase
        .from('cart_items')
        .select('unit_price')
        .eq('id', itemId)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      const newSubtotal = currentItem.unit_price * quantity;

      const { error } = await supabase
        .from('cart_items')
        .update({
          quantity,
          subtotal: newSubtotal,
        })
        .eq('id', itemId);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Failed to update cart item quantity:', error);
      throw error;
    }
  }

  // Remove item from cart
  static async removeFromCart(itemId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Failed to remove item from cart:', error);
      throw error;
    }
  }

  // Clear cart
  static async clearCart(userId?: string): Promise<void> {
    try {
      let query = supabase.from('cart_items').delete();

      if (userId) {
        query = query.eq('user_id', userId);
      } else {
        const sessionId = this.getSessionId();
        query = query.eq('session_id', sessionId);
      }

      const { error } = await query;

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Failed to clear cart:', error);
      throw error;
    }
  }

  // Get cart summary
  static async getCartSummary(userId?: string): Promise<{
    itemCount: number;
    subtotal: number;
    tax: number;
    shippingCost: number;
    total: number;
  }> {
    try {
      const items = await this.getCartItems(userId);
      
      const itemCount = items.reduce((total, item) => total + item.quantity, 0);
      const subtotal = items.reduce((total, item) => total + item.subtotal, 0);
      
      // Calculate shipping (free for orders over 100,000 TZS)
      const shippingCost = subtotal >= 100000 ? 0 : 5000;
      
      // Calculate tax (18% VAT)
      const tax = Math.round(subtotal * 0.18);
      
      const total = subtotal + tax + shippingCost;

      return {
        itemCount,
        subtotal,
        tax,
        shippingCost,
        total,
      };
    } catch (error) {
      console.error('Failed to get cart summary:', error);
      throw error;
    }
  }

  // Migrate guest cart to user cart (when user logs in)
  static async migrateGuestCartToUser(userId: string): Promise<void> {
    try {
      const sessionId = this.getSessionId();

      const { error } = await supabase
        .from('cart_items')
        .update({ user_id: userId, session_id: null })
        .eq('session_id', sessionId);

      if (error) {
        throw error;
      }

      // Clear session ID from localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('cart_session_id');
      }
    } catch (error) {
      console.error('Failed to migrate guest cart:', error);
      throw error;
    }
  }
}