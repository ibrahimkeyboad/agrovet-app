import { useCheckoutStore } from '@/stores/checkoutStore';
import { useOrderStore } from '@/stores/orderStore';
import { useCartStore } from '@/stores/cartStore';
import { ShippingAddress, PaymentMethod, ShippingMethod, OrderItem } from '@/types/ecommerce';

export function useCheckout() {
  const checkoutStore = useCheckoutStore();
  const { createOrder } = useOrderStore();
  const { items, getCartSummary } = useCartStore();

  const processOrder = async () => {
    const { shippingAddress, paymentMethod, shippingMethod } = checkoutStore;
    
    if (!shippingAddress || !paymentMethod || !shippingMethod) {
      throw new Error('Missing required checkout information');
    }

    // Convert cart items to order items
    const orderItems: OrderItem[] = items.map(item => ({
      id: item.id,
      productId: item.productId,
      name: item.name,
      imageUrl: item.imageUrl,
      price: item.price,
      quantity: item.quantity,
      supplier: item.supplier,
      selectedVariants: item.selectedVariants,
      selectedOptions: item.selectedOptions,
      subtotal: item.subtotal,
    }));

    const summary = getCartSummary();

    const order = await createOrder(
      orderItems,
      shippingAddress,
      paymentMethod,
      shippingMethod,
      summary,
      checkoutStore.discountCode
    );

    // Reset checkout state
    checkoutStore.resetCheckout();

    return order;
  };

  const goToNextStep = () => {
    const { step } = checkoutStore;
    
    if (!checkoutStore.canProceedToNextStep()) {
      return false;
    }

    switch (step) {
      case 'shipping':
        checkoutStore.setStep('payment');
        break;
      case 'payment':
        checkoutStore.setStep('review');
        break;
      case 'review':
        checkoutStore.setStep('complete');
        break;
    }
    
    return true;
  };

  const goToPreviousStep = () => {
    const { step } = checkoutStore;
    
    switch (step) {
      case 'payment':
        checkoutStore.setStep('shipping');
        break;
      case 'review':
        checkoutStore.setStep('payment');
        break;
      case 'complete':
        checkoutStore.setStep('review');
        break;
    }
  };

  return {
    ...checkoutStore,
    processOrder,
    goToNextStep,
    goToPreviousStep,
  };
}