import { create } from 'zustand';
import { CheckoutState, ShippingAddress, PaymentMethod, ShippingMethod } from '@/types/ecommerce';

interface CheckoutStore extends CheckoutState {
  // Actions
  setStep: (step: CheckoutState['step']) => void;
  setShippingAddress: (address: ShippingAddress) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  setShippingMethod: (method: ShippingMethod) => void;
  setDiscountCode: (code: string) => void;
  setProcessing: (isProcessing: boolean) => void;
  setError: (field: string, error: string) => void;
  clearError: (field: string) => void;
  clearErrors: () => void;
  resetCheckout: () => void;
  validateShippingAddress: () => boolean;
  validatePaymentMethod: () => boolean;
  canProceedToNextStep: () => boolean;
}

// Mock shipping methods for Tanzania
const SHIPPING_METHODS: ShippingMethod[] = [
  {
    id: 'standard',
    name: 'Standard Delivery',
    description: 'Delivery within 3-5 business days',
    price: 5000, // 5,000 TZS
    estimatedDays: '3-5 days',
    regions: ['Dar es Salaam', 'Arusha', 'Mwanza', 'Dodoma', 'Mbeya'],
  },
  {
    id: 'express',
    name: 'Express Delivery',
    description: 'Delivery within 1-2 business days',
    price: 10000, // 10,000 TZS
    estimatedDays: '1-2 days',
    regions: ['Dar es Salaam', 'Arusha'],
  },
  {
    id: 'pickup',
    name: 'Store Pickup',
    description: 'Pick up from our store location',
    price: 0,
    estimatedDays: 'Same day',
    regions: ['Dar es Salaam'],
  },
];

export const useCheckoutStore = create<CheckoutStore>((set, get) => ({
  step: 'shipping',
  shippingAddress: undefined,
  paymentMethod: undefined,
  shippingMethod: undefined,
  discountCode: undefined,
  isProcessing: false,
  errors: {},

  setStep: (step) => {
    set({ step });
  },

  setShippingAddress: (address) => {
    set({ shippingAddress: address });
    get().clearError('shippingAddress');
  },

  setPaymentMethod: (method) => {
    set({ paymentMethod: method });
    get().clearError('paymentMethod');
  },

  setShippingMethod: (method) => {
    set({ shippingMethod: method });
    get().clearError('shippingMethod');
  },

  setDiscountCode: (code) => {
    set({ discountCode: code });
  },

  setProcessing: (isProcessing) => {
    set({ isProcessing });
  },

  setError: (field, error) => {
    set((state) => ({
      errors: { ...state.errors, [field]: error },
    }));
  },

  clearError: (field) => {
    set((state) => {
      const { [field]: _, ...rest } = state.errors;
      return { errors: rest };
    });
  },

  clearErrors: () => {
    set({ errors: {} });
  },

  resetCheckout: () => {
    set({
      step: 'shipping',
      shippingAddress: undefined,
      paymentMethod: undefined,
      shippingMethod: undefined,
      discountCode: undefined,
      isProcessing: false,
      errors: {},
    });
  },

  validateShippingAddress: () => {
    const { shippingAddress } = get();
    const errors: { [key: string]: string } = {};

    if (!shippingAddress) {
      errors.shippingAddress = 'Shipping address is required';
      set({ errors });
      return false;
    }

    if (!shippingAddress.firstName.trim()) {
      errors.firstName = 'First name is required';
    }

    if (!shippingAddress.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }

    if (!shippingAddress.address.trim()) {
      errors.address = 'Address is required';
    }

    if (!shippingAddress.city.trim()) {
      errors.city = 'City is required';
    }

    if (!shippingAddress.region.trim()) {
      errors.region = 'Region is required';
    }

    if (!shippingAddress.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^(\+255|0)[67]\d{8}$/.test(shippingAddress.phone.replace(/\s/g, ''))) {
      errors.phone = 'Please enter a valid Tanzanian phone number';
    }

    if (Object.keys(errors).length > 0) {
      set({ errors });
      return false;
    }

    set({ errors: {} });
    return true;
  },

  validatePaymentMethod: () => {
    const { paymentMethod } = get();
    const errors: { [key: string]: string } = {};

    if (!paymentMethod) {
      errors.paymentMethod = 'Payment method is required';
      set({ errors });
      return false;
    }

    if (paymentMethod.type === 'mobile_money' && !paymentMethod.accountNumber) {
      errors.accountNumber = 'Mobile money number is required';
    }

    if (Object.keys(errors).length > 0) {
      set({ errors });
      return false;
    }

    set({ errors: {} });
    return true;
  },

  canProceedToNextStep: () => {
    const { step } = get();

    switch (step) {
      case 'shipping':
        return get().validateShippingAddress();
      case 'payment':
        return get().validatePaymentMethod();
      case 'review':
        return true;
      default:
        return false;
    }
  },
}));

// Export shipping methods for use in components
export { SHIPPING_METHODS };