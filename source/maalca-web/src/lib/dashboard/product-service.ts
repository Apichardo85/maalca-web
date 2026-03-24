// Products/Store Service
import { apiClient } from '@/lib/api/apiClient';

export type ProductStatus = 'active' | 'inactive' | 'discontinued';

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: ProductStatus;
  image?: string;
  description?: string;
}

export interface ProductListResponse {
  data: Product[];
  total: number;
}

export interface CreateProductDto {
  name: string;
  category: string;
  price: number;
  stock: number;
  status?: ProductStatus;
  image?: string;
  description?: string;
}

class ProductService {
  /**
   * List products
   * WEB-018: Listar productos desde API
   */
  async list(
    affiliateId: string,
    options: { category?: string; status?: string } = {}
  ): Promise<ProductListResponse | null> {
    try {
      const params = new URLSearchParams();
      if (options.category) params.set('category', options.category);
      if (options.status) params.set('status', options.status);

      const response = await apiClient.get<ProductListResponse>(
        `/api/affiliates/${affiliateId}/products?${params.toString()}`
      );
      return response;
    } catch (error) {
      console.error('Error fetching products:', error);
      return null;
    }
  }

  /**
   * Create/Edit product
   * WEB-019: Crear/editar producto
   */
  async create(affiliateId: string, data: CreateProductDto): Promise<Product | null> {
    try {
      const response = await apiClient.post<Product>(
        `/api/affiliates/${affiliateId}/products`,
        data
      );
      return response;
    } catch (error) {
      console.error('Error creating product:', error);
      return null;
    }
  }

  async update(affiliateId: string, productId: string, data: Partial<CreateProductDto>): Promise<Product | null> {
    try {
      const response = await apiClient.put<Product>(
        `/api/affiliates/${affiliateId}/products/${productId}`,
        data
      );
      return response;
    } catch (error) {
      console.error(`Error updating product ${productId}:`, error);
      return null;
    }
  }

  async delete(affiliateId: string, productId: string): Promise<boolean> {
    try {
      await apiClient.delete(`/api/affiliates/${affiliateId}/products/${productId}`);
      return true;
    } catch (error) {
      console.error(`Error deleting product ${productId}:`, error);
      return false;
    }
  }
}

export const productService = new ProductService();
