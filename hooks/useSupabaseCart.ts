import { useState, useEffect } from 'react';
import { CartItem } from '@/types/ecommerce';
import { Product } from '@/types/product';
import { CartService } from '@/services/cartService';

export function useSupabaseCart(userId?: string) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch cart items
  const fetchCartItems = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const cartItems = await CartService.getCartItems(userId);
      setItems(cartItems);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch cart items');
      console.error('Error fetching cart items:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Add item to cart
  const addToCart = async (
    product: Product,
    quantity: number = 1,
    variants?: { [key: string]: string },
    options?: { [key: string]: string }
  ) => {
    try {
      setIsLoading(true);
      setError(null);
      await CartService.addToCart(product, quantity, variants, options, userId);
      await fetchCartItems(); // Refresh cart
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add item to cart');
      console.error('Error adding to cart:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Update item quantity
  const updateItemQuantity = async (itemId: string, quantity: number) => {
    try {
      setIsLoading(true);
      setError(null);
      await CartService.updateCartItemQuantity(itemId, quantity);
      await fetchCartItems(); // Refresh cart
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update item quantity');
      console.error('Error updating item quantity:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Remove item from cart
  const removeFromCart = async (itemId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await CartService.removeFromCart(itemId);
      await fetchCartItems(); // Refresh cart
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove item from cart');
      console.error('Error removing from cart:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Clear cart
  const clearCart = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await CartService.clearCart(userId);
      setItems([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear cart');
      console.error('Error clearing cart:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Get cart summary
  const getCartSummary = () => {
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
  };

  // Check if item is in cart
  const isItemInCart = (productId: string) => {
    return items.some(item => item.productId === productId);
  };

  // Get cart item
  const getCartItem = (productId: string) => {
    return items.find(item => item.productId === productId);
  };

  // Get total items count
  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  // Load cart items on mount
  useEffect(() => {
    fetchCartItems();
  }, [userId]);

  return {
    items,
    isLoading,
    error,
    isEmpty: items.length === 0,
    addToCart,
    removeFromCart,
    updateItemQuantity,
    clearCart,
    getCartSummary,
    getTotalItems,
    isItemInCart,
    getCartItem,
    refetch: fetchCartItems,
  };
}