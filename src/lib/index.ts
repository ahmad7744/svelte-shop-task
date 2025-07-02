// API exports
export { productsAPI } from "./api/products";
export type { Product, ProductForUI } from "./api/products";

// Store exports
export {
  productsStore,
  uiProductsStore,
  categoriesStore,
  categoryProductsStore,
} from "./stores/products";

// Hook exports
export {
  useProducts,
  useHomeProducts,
  useCategoryProducts,
} from "./hooks/useProducts";
export type {
  UseProductsReturn,
  UseCategoryProductsReturn,
} from "./hooks/useProducts";

// Cart exports
export { cartService } from "./services/cart";
export type { CartItem, CartState, QueuedOperation } from "./services/cart";
export { useCart } from "./hooks/cart.svelte

// Checkout exports
export { checkoutService } from "./services/checkout";
export type { CheckoutState } from "./services/checkout";

// Constants
export { FAKESTORE_API } from "./constant";
