import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PaymentMethod } from '@/types/ecommerce';

interface PaymentStore {
  paymentMethods: PaymentMethod[];
  isLoading: boolean;
  error?: string;

  // Actions
  addPaymentMethod: (method: Omit<PaymentMethod, 'id'>) => void;
  updatePaymentMethod: (id: string, updates: Partial<PaymentMethod>) => void;
  deletePaymentMethod: (id: string) => void;
  setDefaultPaymentMethod: (id: string) => void;
  getDefaultPaymentMethod: () => PaymentMethod | undefined;
  getPaymentMethod: (id: string) => PaymentMethod | undefined;
  getPaymentMethodsByType: (type: PaymentMethod['type']) => PaymentMethod[];
  clearPaymentMethods: () => void;
}

// Default payment methods for Tanzania
const DEFAULT_PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'mpesa',
    type: 'mobile_money',
    provider: 'M-Pesa',
    isDefault: true,
  },
  {
    id: 'airtel',
    type: 'mobile_money',
    provider: 'Airtel Money',
    isDefault: false,
  },
  {
    id: 'tigo',
    type: 'mobile_money',
    provider: 'Tigo Pesa',
    isDefault: false,
  },
  {
    id: 'cod',
    type: 'cash_on_delivery',
    provider: 'Cash on Delivery',
    isDefault: false,
  },
];

export const usePaymentStore = create<PaymentStore>()(
  persist(
    (set, get) => ({
      paymentMethods: DEFAULT_PAYMENT_METHODS,
      isLoading: false,
      error: undefined,

      addPaymentMethod: (methodData) => {
        set({ isLoading: true, error: undefined });

        try {
          const id = `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          const paymentMethods = get().paymentMethods;
          
          // If setting as default, remove default from other methods
          const updatedMethods = methodData.isDefault 
            ? paymentMethods.map(method => ({ ...method, isDefault: false }))
            : paymentMethods;

          const newMethod: PaymentMethod = {
            ...methodData,
            id,
          };

          set({
            paymentMethods: [...updatedMethods, newMethod],
            isLoading: false,
          });
        } catch (error) {
          set({ error: 'Failed to add payment method', isLoading: false });
        }
      },

      updatePaymentMethod: (id, updates) => {
        set({ isLoading: true, error: undefined });

        try {
          const paymentMethods = get().paymentMethods;
          let updatedMethods = paymentMethods.map(method =>
            method.id === id ? { ...method, ...updates } : method
          );

          // If setting as default, remove default from other methods
          if (updates.isDefault) {
            updatedMethods = updatedMethods.map(method =>
              method.id === id ? method : { ...method, isDefault: false }
            );
          }

          set({ paymentMethods: updatedMethods, isLoading: false });
        } catch (error) {
          set({ error: 'Failed to update payment method', isLoading: false });
        }
      },

      deletePaymentMethod: (id) => {
        set({ isLoading: true, error: undefined });

        try {
          const paymentMethods = get().paymentMethods;
          const methodToDelete = paymentMethods.find(method => method.id === id);
          const remainingMethods = paymentMethods.filter(method => method.id !== id);

          // If deleted method was default and there are remaining methods,
          // make the first one default
          if (methodToDelete?.isDefault && remainingMethods.length > 0) {
            remainingMethods[0].isDefault = true;
          }

          set({ paymentMethods: remainingMethods, isLoading: false });
        } catch (error) {
          set({ error: 'Failed to delete payment method', isLoading: false });
        }
      },

      setDefaultPaymentMethod: (id) => {
        set({ isLoading: true, error: undefined });

        try {
          const paymentMethods = get().paymentMethods.map(method => ({
            ...method,
            isDefault: method.id === id,
          }));

          set({ paymentMethods, isLoading: false });
        } catch (error) {
          set({ error: 'Failed to set default payment method', isLoading: false });
        }
      },

      getDefaultPaymentMethod: () => {
        return get().paymentMethods.find(method => method.isDefault);
      },

      getPaymentMethod: (id) => {
        return get().paymentMethods.find(method => method.id === id);
      },

      getPaymentMethodsByType: (type) => {
        return get().paymentMethods.filter(method => method.type === type);
      },

      clearPaymentMethods: () => {
        set({ paymentMethods: DEFAULT_PAYMENT_METHODS });
      },
    }),
    {
      name: 'agrilink-payments',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        paymentMethods: state.paymentMethods.filter(method => !DEFAULT_PAYMENT_METHODS.some(def => def.id === method.id)),
      }),
    }
  )
);