import { cartService, type CartItem } from "$lib/services/cart";
import type { ProductForUI } from "$lib/api/products";
import { onMount, onDestroy } from "svelte";

export function useCart() {
  // Create reactive state that updates when cart service changes
  let cartState = $state(cartService.getState());
  let unsubscribe: (() => void) | null = null;

  // Function to update cart state
  const updateCartState = () => {
    cartState = cartService.getState();
  };

  // Subscribe to cart service changes
  onMount(() => {
    // Initial state
    updateCartState();

    // Subscribe to changes
    unsubscribe = cartService.subscribe(updateCartState);
  });

  // Cleanup subscription
  onDestroy(() => {
    if (unsubscribe) {
      unsubscribe();
    }
  });

  // Convert ProductForUI to CartItem format
  const convertProductToCartItem = (
    product: ProductForUI
  ): Omit<CartItem, "quantity"> => {
    return {
      id: product.id.toString(),
      name: product.name,
      price: parseFloat(product.price.replace("$", "")),
      image: product.image,
      category: product.category,
    };
  };

  // Add product to cart with optimistic update
  const addToCart = (product: ProductForUI, quantity: number = 1) => {
    const cartItem = convertProductToCartItem(product);

    // Optimistic update - immediately update UI
    const currentState = cartService.getState();
    const existingItemIndex = currentState.items.findIndex(
      (item) => item.id === cartItem.id
    );

    if (existingItemIndex >= 0) {
      // Update existing item quantity
      cartState = {
        ...currentState,
        items: currentState.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + quantity }
            : item
        ),
      };
    } else {
      // Add new item
      cartState = {
        ...currentState,
        items: [...currentState.items, { ...cartItem, quantity }],
      };
    }

    // Recalculate totals
    const total = cartState.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const itemCount = cartState.items.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    cartState = {
      ...cartState,
      total: Math.round(total * 100) / 100,
      itemCount,
    };

    // Queue the actual operation
    return cartService.addItem(cartItem, quantity);
  };

  // Remove item from cart with optimistic update
  const removeFromCart = (itemId: string) => {
    // Optimistic update - immediately update UI
    const currentState = cartService.getState();
    cartState = {
      ...currentState,
      items: currentState.items.filter((item) => item.id !== itemId),
    };

    // Recalculate totals
    const total = cartState.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const itemCount = cartState.items.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    cartState = {
      ...cartState,
      total: Math.round(total * 100) / 100,
      itemCount,
    };

    // Queue the actual operation
    return cartService.removeItem(itemId);
  };

  // Update item quantity with optimistic update
  const updateQuantity = (itemId: string, quantity: number) => {
    // Optimistic update - immediately update UI
    const currentState = cartService.getState();
    const itemIndex = currentState.items.findIndex(
      (item) => item.id === itemId
    );

    if (itemIndex >= 0) {
      if (quantity <= 0) {
        // Remove item
        cartState = {
          ...currentState,
          items: currentState.items.filter((item) => item.id !== itemId),
        };
      } else {
        // Update quantity
        cartState = {
          ...currentState,
          items: currentState.items.map((item, index) =>
            index === itemIndex ? { ...item, quantity } : item
          ),
        };
      }

      // Recalculate totals
      const total = cartState.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      const itemCount = cartState.items.reduce(
        (sum, item) => sum + item.quantity,
        0
      );
      cartState = {
        ...cartState,
        total: Math.round(total * 100) / 100,
        itemCount,
      };
    }

    // Queue the actual operation
    return cartService.updateQuantity(itemId, quantity);
  };

  // Clear entire cart with optimistic update
  const clearCart = () => {
    // Optimistic update - immediately update UI
    cartState = {
      ...cartService.getState(),
      items: [],
      total: 0,
      itemCount: 0,
    };

    // Queue the actual operation
    return cartService.clearCart();
  };

  // Check if product is in cart
  const isInCart = (productId: string) => {
    return cartService.isItemInCart(productId.toString());
  };

  // Get product quantity in cart
  const getQuantity = (productId: string) => {
    return cartService.getItemQuantity(productId.toString());
  };

  // Get operation status
  const getOperationStatus = (operationId: string) => {
    return cartService.getOperationStatus(operationId);
  };

  return {
    // Reactive state
    cartState,

    // Actions
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,

    // Getters
    isInCart,
    getQuantity,
    getOperationStatus,
  };
}
