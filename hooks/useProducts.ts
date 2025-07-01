import { useState, useEffect } from 'react';
import { Product } from '@/types/product';
import { ProductService } from '@/services/productService';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ProductService.getAllProducts();
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    loading,
    error,
    refetch: fetchProducts,
  };
}

export function useFeaturedProducts(limit: number = 6) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeaturedProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ProductService.getFeaturedProducts(limit);
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch featured products');
      console.error('Error fetching featured products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeaturedProducts();
  }, [limit]);

  return {
    products,
    loading,
    error,
    refetch: fetchFeaturedProducts,
  };
}

export function useNewProducts(limit: number = 6) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNewProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ProductService.getNewProducts(limit);
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch new products');
      console.error('Error fetching new products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNewProducts();
  }, [limit]);

  return {
    products,
    loading,
    error,
    refetch: fetchNewProducts,
  };
}

export function useProductsByCategory(categoryId: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProductsByCategory = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ProductService.getProductsByCategory(categoryId);
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products by category');
      console.error('Error fetching products by category:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (categoryId) {
      fetchProductsByCategory();
    }
  }, [categoryId]);

  return {
    products,
    loading,
    error,
    refetch: fetchProductsByCategory,
  };
}

export function useProduct(id: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ProductService.getProductById(id);
      setProduct(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch product');
      console.error('Error fetching product:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  return {
    product,
    loading,
    error,
    refetch: fetchProduct,
  };
}

export function useProductSearch(query: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchProducts = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setProducts([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await ProductService.searchProducts(searchQuery);
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search products');
      console.error('Error searching products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchProducts(query);
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [query]);

  return {
    products,
    loading,
    error,
    search: searchProducts,
  };
}