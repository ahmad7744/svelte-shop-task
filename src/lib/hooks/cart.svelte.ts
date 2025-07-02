import { type CartItem } from "$lib/services/cart";
import { cartService } from "$lib/services/cart";
import type { ProductForUI } from "$lib/api/products";

let cartState = $state<CartItem[]>([]);

// Subscribe to cart service changes
cartService.subscribe(() => {
  cartState = cartService.getState().items;
});

export const getCartState = () => {
  return cartState;
};

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

// Add product to cart with queue support
export const addToCart = (product: ProductForUI, quantity: number = 1) => {
  const cartItem = convertProductToCartItem(product);
  return cartService.addItem(cartItem, quantity);
};

// Remove item from cart with queue support
export const removeFromCart = (itemId: string) => {
  return cartService.removeItem(itemId);
};

// Update item quantity with queue support
export const updateQuantity = (itemId: string, quantity: number) => {
  return cartService.updateQuantity(itemId, quantity);
};

// Clear entire cart with queue support
export const clearCart = () => {
  return cartService.clearCart();
};

// Check if product is in cart
export const isInCart = (productId: string) => {
  return cartService.isItemInCart(productId);
};

// Get product quantity in cart
export const getQuantity = (productId: string) => {
  return cartService.getItemQuantity(productId);
};

// Get operation status
export const getOperationStatus = (operationId: string) => {
  return cartService.getOperationStatus(operationId);
};
