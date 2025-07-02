import { onMount } from "svelte";
import {
  productsStore,
  uiProductsStore,
  categoriesStore,
  categoryProductsStore,
} from "$lib/stores/products";
import {
  productsAPI,
  type ProductForUI,
} from "$lib/api/products";

export interface UseProductsReturn {
  // Stores
  productsStore: typeof productsStore;
  uiProductsStore: typeof uiProductsStore;
  categoriesStore: typeof categoriesStore;

  // Actions
  loadProducts: () => Promise<void>;
  loadCategories: () => Promise<void>;
  loadProductsByCategory: (category: string) => Promise<ProductForUI[]>;
  loadProductById: (id: number) => Promise<ProductForUI>;
}

export interface UseCategoryProductsReturn {
  // Store
  categoryProductsStore: typeof categoryProductsStore;

  // Actions
  loadCategoryProducts: (category?: string) => Promise<void>;
  updateFilters: (filters: object) => void;
  setCurrentPage: (page: number) => void;
  loadCategories: () => Promise<void>;

  // Stores
  categoriesStore: typeof categoriesStore;
}

export function useProducts(): UseProductsReturn {
  // Load products automatically on mount
  const loadProducts = async () => {
    await productsStore.fetchProducts();
  };

  // Load categories
  const loadCategories = async () => {
    await categoriesStore.fetchCategories();
  };

  // Load products by category
  const loadProductsByCategory = async (
    category: string
  ): Promise<ProductForUI[]> => {
    try {
      const products = await productsAPI.getProductsByCategory(category);
      return productsAPI.transformProductsForUI(products);
    } catch (error) {
      console.error(`Error loading products for category ${category}:`, error);
      throw error;
    }
  };

  // Load single product by ID
  const loadProductById = async (id: number): Promise<ProductForUI> => {
    try {
      const product = await productsAPI.getProductById(id);
      return productsAPI.transformProductForUI(product);
    } catch (error) {
      console.error(`Error loading product ${id}:`, error);
      throw error;
    }
  };

  return {
    productsStore,
    uiProductsStore,
    categoriesStore,
    loadProducts,
    loadCategories,
    loadProductsByCategory,
    loadProductById,
  };
}

// Hook for category products with pagination and filtering
export function useCategoryProducts(): UseCategoryProductsReturn {
  const loadCategoryProducts = async (category?: string) => {
    await categoryProductsStore.fetchCategoryProducts(category);
  };

  const loadCategories = async () => {
    await categoriesStore.fetchCategories();
  };

  const updateFilters = (filters: object) => {
    categoryProductsStore.updateFilters(filters);
  };

  const setCurrentPage = (page: number) => {
    categoryProductsStore.setCurrentPage(page);
  };

  return {
    categoryProductsStore,
    categoriesStore,
    loadCategoryProducts,
    updateFilters,
    setCurrentPage,
    loadCategories,
  };
}

// Hook specifically for home page that auto-loads products
export function useHomeProducts() {
  const productsHook = useProducts();

  onMount(() => {
    productsHook.loadProducts();
  });

  return productsHook;
}
