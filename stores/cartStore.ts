import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CartItem, CartSummary, Product, DiscountCode } from '@/types/ecommerce';
import { calculateTax, roundCurrency } from '@/utils/currency';

interface CartStore {
  items: CartItem[];
  discountCode?: string;
  discountAmount: number;
  isLoading: boolean;
  error?: string;
  // Add cached summary to prevent infinite loops
  _cachedSummary?: CartSummary;

  // Actions
  addItem: (product: Product, quantity?: number, variants?: { [key: string]: string }, options?: { [key: string]: string }) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  applyDiscountCode: (code: string) => Promise<boolean>;
  removeDiscountCode: () => void;
  getCartSummary: () => CartSummary;
  getItemCount: () => number;
  isItemInCart: (productId: string) => boolean;
  getCartItem: (productId: string) => CartItem | undefined;
  // Internal method to update cached summary
  _updateCachedSummary: () => void;
}

// Mock discount codes
const MOCK_DISCOUNT_CODES: DiscountCode[] = [
  {
    code: 'WELCOME10',
    type: 'percentage',
    value: 10,
    minimumAmount: 50000, // 50,000 TZS
  },
  {
    code: 'SAVE5000',
    type: 'fixed',
    value: 5000, // 5,000 TZS
    minimumAmount: 25000, // 25,000 TZS
  },
  {
    code: 'FARMER20',
    type: 'percentage',
    value: 20,
    minimumAmount: 100000, // 100,000 TZS
  },
];

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      discountCode: undefined,
      discountAmount: 0,
      isLoading: false,
      error: undefined,
      _cachedSummary: undefined,

      _updateCachedSummary: () => {
        const { items, discountAmount } = get();
        
        const itemCount = items.reduce((total, item) => total + item.quantity, 0);
        const subtotal = items.reduce((total, item) => total + item.subtotal, 0);
        
        // Calculate shipping (free for orders over 100,000 TZS)
        const shippingCost = subtotal >= 100000 ? 0 : 5000; // 5,000 TZS shipping
        
        // Calculate tax on subtotal minus discount
        const taxableAmount = Math.max(0, subtotal - discountAmount);
        const tax = calculateTax(taxableAmount);
        
        const total = roundCurrency(subtotal + tax + shippingCost - discountAmount);

        const summary: CartSummary = {
          itemCount,
          subtotal: roundCurrency(subtotal),
          tax: roundCurrency(tax),
          shippingCost: roundCurrency(shippingCost),
          discountAmount: roundCurrency(discountAmount),
          total: Math.max(0, total),
        };

        set({ _cachedSummary: summary });
      },

      addItem: (product, quantity = 1, variants, options) => {
        set({ isLoading: true, error: undefined });

        try {
          const items = get().items;
          const itemId = `${product.id}-${JSON.stringify(variants || {})}-${JSON.stringify(options || {})}`;
          
          // Calculate price with variant adjustments
          let itemPrice = product.price;
          if (variants && product.variants) {
            product.variants.forEach(variant => {
              if (variants[variant.name] === variant.value) {
                itemPrice += variant.priceAdjustment;
              }
            });
          }

          const existingItemIndex = items.findIndex(item => item.id === itemId);

          if (existingItemIndex >= 0) {
            // Update existing item quantity
            const updatedItems = [...items];
            const newQuantity = updatedItems[existingItemIndex].quantity + quantity;
            updatedItems[existingItemIndex] = {
              ...updatedItems[existingItemIndex],
              quantity: newQuantity,
              subtotal: roundCurrency(newQuantity * itemPrice),
            };
            set({ items: updatedItems });
          } else {
            // Add new item
            const newItem: CartItem = {
              id: itemId,
              productId: product.id,
              name: product.name,
              imageUrl: product.imageUrl,
              price: itemPrice,
              quantity,
              supplier: product.supplier,
              selectedVariants: variants,
              selectedOptions: options,
              subtotal: roundCurrency(quantity * itemPrice),
            };
            set({ items: [...items, newItem] });
          }

          // Update cached summary
          get()._updateCachedSummary();

          // Recalculate discount if applied
          const { discountCode } = get();
          if (discountCode) {
            get().applyDiscountCode(discountCode);
          }
        } catch (error) {
          set({ error: 'Failed to add item to cart' });
        } finally {
          set({ isLoading: false });
        }
      },

      removeItem: (itemId) => {
        set({ isLoading: true, error: undefined });

        try {
          const items = get().items.filter(item => item.id !== itemId);
          set({ items });

          // Update cached summary
          get()._updateCachedSummary();

          // Recalculate discount if applied
          const { discountCode } = get();
          if (discountCode) {
            get().applyDiscountCode(discountCode);
          }
        } catch (error) {
          set({ error: 'Failed to remove item from cart' });
        } finally {
          set({ isLoading: false });
        }
      },

      updateQuantity: (itemId, quantity) => {
        set({ isLoading: true, error: undefined });

        try {
          if (quantity <= 0) {
            get().removeItem(itemId);
            return;
          }

          const items = get().items;
          const updatedItems = items.map(item => {
            if (item.id === itemId) {
              return {
                ...item,
                quantity,
                subtotal: roundCurrency(quantity * item.price),
              };
            }
            return item;
          });

          set({ items: updatedItems });

          // Update cached summary
          get()._updateCachedSummary();

          // Recalculate discount if applied
          const { discountCode } = get();
          if (discountCode) {
            get().applyDiscountCode(discountCode);
          }
        } catch (error) {
          set({ error: 'Failed to update item quantity' });
        } finally {
          set({ isLoading: false });
        }
      },

      clearCart: () => {
        set({
          items: [],
          discountCode: undefined,
          discountAmount: 0,
          error: undefined,
          _cachedSummary: undefined,
        });
      },

      applyDiscountCode: async (code) => {
        set({ isLoading: true, error: undefined });

        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));

          const discount = MOCK_DISCOUNT_CODES.find(d => d.code.toLowerCase() === code.toLowerCase());
          
          if (!discount) {
            set({ error: 'Invalid discount code' });
            return false;
          }

          // Get current summary to check minimum amount
          get()._updateCachedSummary();
          const summary = get()._cachedSummary!;
          
          if (discount.minimumAmount && summary.subtotal < discount.minimumAmount) {
            set({ error: `Minimum order amount is ${discount.minimumAmount.toLocaleString()} TZS` });
            return false;
          }

          let discountAmount = 0;
          if (discount.type === 'percentage') {
            discountAmount = roundCurrency(summary.subtotal * (discount.value / 100));
          } else {
            discountAmount = discount.value;
          }

          // Ensure discount doesn't exceed subtotal
          discountAmount = Math.min(discountAmount, summary.subtotal);

          set({
            discountCode: code,
            discountAmount,
            error: undefined,
          });

          // Update cached summary with new discount
          get()._updateCachedSummary();

          return true;
        } catch (error) {
          set({ error: 'Failed to apply discount code' });
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      removeDiscountCode: () => {
        set({
          discountCode: undefined,
          discountAmount: 0,
          error: undefined,
        });
        // Update cached summary
        get()._updateCachedSummary();
      },

      getCartSummary: (): CartSummary => {
        const { _cachedSummary } = get();
        
        // If no cached summary, calculate and cache it
        if (!_cachedSummary) {
          get()._updateCachedSummary();
          return get()._cachedSummary!;
        }
        
        return _cachedSummary;
      },

      getItemCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      isItemInCart: (productId) => {
        return get().items.some(item => item.productId === productId);
      },

      getCartItem: (productId) => {
        return get().items.find(item => item.productId === productId);
      },
    }),
    {
      name: 'agrilink-cart',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        items: state.items,
        discountCode: state.discountCode,
        discountAmount: state.discountAmount,
      }),
      onRehydrateStorage: () => (state) => {
        // Update cached summary after rehydration
        if (state) {
          state._updateCachedSummary();
        }
      },
    }
  )
);