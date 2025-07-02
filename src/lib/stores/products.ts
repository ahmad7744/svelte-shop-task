import { writable, derived } from "svelte/store";
import {
  productsAPI,
  type Product,
  type ProductForUI,
} from "$lib/api/products";

interface ProductsState {
  products: Product[];
  loading: boolean;
  error: string | null;
}

interface UIProductsState {
  newArrivals: ProductForUI[];
  topSelling: ProductForUI[];
  allProducts: ProductForUI[];
  loading: boolean;
  error: string | null;
}

// New interface for category page state
interface CategoryProductsFilters {
  category: string;
  priceRange: { min: number; max: number };
  sortBy: string;
  searchQuery?: string;
}

interface CategoryProductsState {
  allProducts: ProductForUI[];
  filteredProducts: ProductForUI[];
  currentPage: number;
  itemsPerPage: number;
  totalProducts: number;
  loading: boolean;
  error: string | null;
  filters: CategoryProductsFilters;
}

// Create the main products store
function createProductsStore() {
  const { subscribe, set, update } = writable<ProductsState>({
    products: [],
    loading: false,
    error: null,
  });

  return {
    subscribe,
    // Fetch all products
    fetchProducts: async () => {
      update((state) => ({ ...state, loading: true, error: null }));
      try {
        const products = await productsAPI.getAllProducts();
        update((state) => ({ ...state, products, loading: false }));
      } catch (error) {
        update((state) => ({
          ...state,
          loading: false,
          error:
            error instanceof Error ? error.message : "Failed to fetch products",
        }));
      }
    },
    // Reset store
    reset: () => set({ products: [], loading: false, error: null }),
  };
}

export const productsStore = createProductsStore();

// Derived store for UI-formatted products
export const uiProductsStore = derived(
  productsStore,
  ($productsStore): UIProductsState => {
    const uiProducts = productsAPI.transformProductsForUI(
      $productsStore.products
    );

    // Split products for different sections
    // For demo purposes, we'll use first 4 as new arrivals and next 4 as top selling
    const newArrivals = uiProducts.slice(0, 4);
    const topSelling = uiProducts.slice(4, 8);

    return {
      newArrivals,
      topSelling,
      allProducts: uiProducts,
      loading: $productsStore.loading,
      error: $productsStore.error,
    };
  }
);

// Category products store for category page
function createCategoryProductsStore() {
  const { subscribe, set, update } = writable<CategoryProductsState>({
    allProducts: [],
    filteredProducts: [],
    currentPage: 1,
    itemsPerPage: 10,
    totalProducts: 0,
    loading: false,
    error: null,
    filters: {
      category: "all",
      priceRange: { min: 0, max: 1000 },
      sortBy: "default",
    },
  });

  const applyFilters = (
    products: ProductForUI[],
    filters: CategoryProductsState["filters"]
  ) => {
    let filtered = [...products];

    // Filter by search query
    if (filters.searchQuery && filters.searchQuery.trim()) {
      const lowercaseQuery = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(lowercaseQuery) ||
          product.category.toLowerCase().includes(lowercaseQuery) ||
          product.description.toLowerCase().includes(lowercaseQuery)
      );
    }

    // Filter by category
    if (filters.category && filters.category !== "all") {
      filtered = filtered.filter(
        (product) =>
          product.category.toLowerCase() === filters.category.toLowerCase()
      );
    }

    // Filter by price range
    filtered = filtered.filter((product) => {
      const price = parseFloat(product.price.replace("$", ""));
      return price >= filters.priceRange.min && price <= filters.priceRange.max;
    });

    // Sort products
    switch (filters.sortBy) {
      case "price-low":
        filtered.sort(
          (a, b) =>
            parseFloat(a.price.replace("$", "")) -
            parseFloat(b.price.replace("$", ""))
        );
        break;
      case "price-high":
        filtered.sort(
          (a, b) =>
            parseFloat(b.price.replace("$", "")) -
            parseFloat(a.price.replace("$", ""))
        );
        break;
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "rating":
        filtered.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
        break;
      default:
        // Keep original order for 'default' and 'popular'
        break;
    }

    return filtered;
  };

  return {
    subscribe,
    // Fetch products for category
    fetchCategoryProducts: async (category?: string) => {
      update((state) => ({ ...state, loading: true, error: null }));
      try {
        const products = category
          ? await productsAPI.getProductsByCategory(category)
          : await productsAPI.getAllProducts();

        const transformedProducts =
          productsAPI.transformProductsForUI(products);

        update((state) => ({
          ...state,
          allProducts: transformedProducts,
          filteredProducts: transformedProducts,
          totalProducts: transformedProducts.length,
          loading: false,
          filters: { ...state.filters, category: category || "all" },
        }));
      } catch (error) {
        update((state) => ({
          ...state,
          loading: false,
          error:
            error instanceof Error ? error.message : "Failed to load products",
        }));
      }
    },
    // Update filters
    updateFilters: (newFilters: Partial<CategoryProductsState["filters"]>) => {
      update((state) => {
        const updatedFilters = { ...state.filters, ...newFilters };
        const filteredProducts = applyFilters(
          state.allProducts,
          updatedFilters
        );

        return {
          ...state,
          filters: updatedFilters,
          filteredProducts,
          totalProducts: filteredProducts.length,
          currentPage: 1, // Reset to first page when filters change
        };
      });
    },
    // Set current page
    setCurrentPage: (page: number) => {
      update((state) => ({ ...state, currentPage: page }));
    },
    // Get paginated products
    getPaginatedProducts: () => {
      return derived({ subscribe }, ($state) => {
        const startIndex = ($state.currentPage - 1) * $state.itemsPerPage;
        const endIndex = startIndex + $state.itemsPerPage;
        return $state.filteredProducts.slice(startIndex, endIndex);
      });
    },
    // Reset store
    reset: () =>
      set({
        allProducts: [],
        filteredProducts: [],
        totalProducts: 0,
        loading: false,
        error: null,
        currentPage: 1,
        itemsPerPage: 10,
        filters: {
          category: "all",
          priceRange: { min: 0, max: 1000 },
          sortBy: "default",
        },
      }),
  };
}

export const categoryProductsStore = createCategoryProductsStore();

// Individual category stores
function createCategoryStore() {
  const { subscribe, set, update } = writable<{
    categories: string[];
    loading: boolean;
    error: string | null;
  }>({
    categories: [],
    loading: false,
    error: null,
  });

  return {
    subscribe,
    fetchCategories: async () => {
      update((state) => ({ ...state, loading: true, error: null }));
      try {
        const categories = await productsAPI.getCategories();
        update((state) => ({ ...state, categories, loading: false }));
      } catch (error) {
        update((state) => ({
          ...state,
          loading: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to fetch categories",
        }));
      }
    },
    reset: () => set({ categories: [], loading: false, error: null }),
  };
}

export const categoriesStore = createCategoryStore();
