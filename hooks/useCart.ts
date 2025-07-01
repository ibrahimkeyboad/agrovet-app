import { useCartStore } from '@/stores/cartStore';
import { Product } from '@/types/ecommerce';
import { useMemo } from 'react';

export function useCart() {
  const {
    items,
    isLoading,
    error,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getItemCount,
    isItemInCart,
    getCartItem,
    discountAmount,
  } = useCartStore();

  // Memoize cart summary to prevent infinite loops
  const cartSummary = useMemo(() => {
    const itemCount = items.reduce((total, item) => total + item.quantity, 0);
    const subtotal = items.reduce((total, item) => total + item.subtotal, 0);
    
    // Calculate shipping (free for orders over 100,000 TZS)
    const shippingCost = subtotal >= 100000 ? 0 : 5000;
    
    // Calculate tax on subtotal minus discount
    const taxableAmount = Math.max(0, subtotal - discountAmount);
    const tax = Math.round(taxableAmount * 0.18); // 18% VAT
    
    const total = Math.round(subtotal + tax + shippingCost - discountAmount);

    return {
      itemCount,
      subtotal: Math.round(subtotal),
      tax: Math.round(tax),
      shippingCost: Math.round(shippingCost),
      discountAmount: Math.round(discountAmount),
      total: Math.max(0, total),
    };
  }, [items, discountAmount]);

  const addToCart = (
    product: Product,
    quantity: number = 1,
    variants?: { [key: string]: string },
    options?: { [key: string]: string }
  ) => {
    addItem(product, quantity, variants, options);
  };

  const removeFromCart = (itemId: string) => {
    removeItem(itemId);
  };

  const updateItemQuantity = (itemId: string, quantity: number) => {
    updateQuantity(itemId, quantity);
  };

  const getTotalItems = () => {
    return getItemCount();
  };

  const getCartSummary = () => {
    return cartSummary;
  };

  const getTotal = () => {
    return cartSummary.total;
  };

  const isEmpty = items.length === 0;

  return {
    items,
    isLoading,
    error,
    isEmpty,
    addToCart,
    removeFromCart,
    updateItemQuantity,
    clearCart,
    getCartSummary,
    getTotalItems,
    getTotal,
    isItemInCart,
    getCartItem,
  };
}