import { FAKESTORE_API } from "$lib/constant";

export interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: {
    rate: number;
    count: number;
  };
}

export interface ProductForUI {
  id: number;
  name: string;
  price: string;
  image: string;
  rating: string;
  category: string;
  description: string;
}

class ProductsAPI {
  private baseURL = FAKESTORE_API;

  async getAllProducts(): Promise<Product[]> {
    try {
      const response = await fetch(`${this.baseURL}/products`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  }

  async getProductById(id: number): Promise<Product> {
    try {
      const response = await fetch(`${this.baseURL}/products/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error);
      throw error;
    }
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    try {
      const response = await fetch(
        `${this.baseURL}/products/category/${category}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching products for category ${category}:`, error);
      throw error;
    }
  }

  async getCategories(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseURL}/products/categories`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }
  }

  // Transform API product to UI format
  transformProductForUI(product: Product): ProductForUI {
    return {
      id: product.id,
      name: product.title,
      price: `$${product.price}`,
      image: product.image,
      rating: `${product.rating.rate}/5`,
      category: product.category,
      description: product.description,
    };
  }

  // Transform multiple products for UI
  transformProductsForUI(products: Product[]): ProductForUI[] {
    return products.map((product) => this.transformProductForUI(product));
  }
}

export const productsAPI = new ProductsAPI();
