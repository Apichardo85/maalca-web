/**
 * Centralized API client for making HTTP requests to the backend
 * Handles authentication, tenant context, and error handling
 */

import { ApiError } from "../types/common";

/**
 * API Client configuration
 */
interface ApiClientConfig {
  baseUrl: string;
  tenantId?: string;
  headers?: Record<string, string>;
}

/**
 * Request options
 */
interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

/**
 * Get the API base URL from environment variables
 * Falls back to localhost:5000 for development
 */
const getBaseUrl = (): string => {
  return process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
};

/**
 * Custom error class for API errors
 */
export class ApiClientError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

/**
 * Build URL with query parameters
 */
const buildUrl = (
  baseUrl: string,
  endpoint: string,
  params?: Record<string, string | number | boolean | undefined>
): string => {
  const url = new URL(endpoint, baseUrl);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  return url.toString();
};

/**
 * Handle API response and errors
 */
const handleResponse = async <T>(response: Response): Promise<T> => {
  // Handle successful responses
  if (response.ok) {
    // Handle 204 No Content
    if (response.status === 204) {
      return undefined as T;
    }

    const data = await response.json();
    return data as T;
  }

  // Handle error responses
  let errorMessage = `API Error: ${response.status} ${response.statusText}`;
  let errorCode: string | undefined;
  let errorDetails: Record<string, unknown> | undefined;

  try {
    const errorData: ApiError = await response.json();
    errorMessage = errorData.message || errorMessage;
    errorCode = errorData.code;
    errorDetails = errorData.details;
  } catch {
    // If error response is not JSON, use default message
  }

  throw new ApiClientError(errorMessage, response.status, errorCode, errorDetails);
};

/**
 * Create API client instance
 */
class ApiClient {
  private config: ApiClientConfig;

  constructor(config?: Partial<ApiClientConfig>) {
    this.config = {
      baseUrl: getBaseUrl(),
      ...config,
    };
  }

  /**
   * Set tenant ID for subsequent requests
   * Useful for multi-tenant context
   */
  setTenantId(tenantId: string): void {
    this.config.tenantId = tenantId;
  }

  /**
   * Get current tenant ID
   */
  getTenantId(): string | undefined {
    return this.config.tenantId;
  }

  /**
   * Build headers for request
   * Includes tenant ID if available
   */
  private buildHeaders(customHeaders?: Record<string, string>): HeadersInit {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...this.config.headers,
      ...customHeaders,
    };

    // Add tenant ID to headers if available
    // TODO: Coordinate with backend on header name (X-Tenant-Id, X-Tenant, etc.)
    if (this.config.tenantId) {
      headers["X-Tenant-Id"] = this.config.tenantId;
    }

    return headers;
  }

  /**
   * Generic GET request
   */
  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    const url = buildUrl(this.config.baseUrl, endpoint, options?.params);

    const response = await fetch(url, {
      method: "GET",
      headers: this.buildHeaders(options?.headers as Record<string, string>),
      ...options,
    });

    return handleResponse<T>(response);
  }

  /**
   * Generic POST request
   */
  async post<T, B = unknown>(
    endpoint: string,
    body: B,
    options?: RequestOptions
  ): Promise<T> {
    const url = buildUrl(this.config.baseUrl, endpoint, options?.params);

    const response = await fetch(url, {
      method: "POST",
      headers: this.buildHeaders(options?.headers as Record<string, string>),
      body: JSON.stringify(body),
      ...options,
    });

    return handleResponse<T>(response);
  }

  /**
   * Generic PUT request
   */
  async put<T, B = unknown>(
    endpoint: string,
    body: B,
    options?: RequestOptions
  ): Promise<T> {
    const url = buildUrl(this.config.baseUrl, endpoint, options?.params);

    const response = await fetch(url, {
      method: "PUT",
      headers: this.buildHeaders(options?.headers as Record<string, string>),
      body: JSON.stringify(body),
      ...options,
    });

    return handleResponse<T>(response);
  }

  /**
   * Generic PATCH request
   */
  async patch<T, B = unknown>(
    endpoint: string,
    body: B,
    options?: RequestOptions
  ): Promise<T> {
    const url = buildUrl(this.config.baseUrl, endpoint, options?.params);

    const response = await fetch(url, {
      method: "PATCH",
      headers: this.buildHeaders(options?.headers as Record<string, string>),
      body: JSON.stringify(body),
      ...options,
    });

    return handleResponse<T>(response);
  }

  /**
   * Generic DELETE request
   */
  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    const url = buildUrl(this.config.baseUrl, endpoint, options?.params);

    const response = await fetch(url, {
      method: "DELETE",
      headers: this.buildHeaders(options?.headers as Record<string, string>),
      ...options,
    });

    return handleResponse<T>(response);
  }
}

/**
 * Default API client instance
 * Use this for most API calls
 */
export const apiClient = new ApiClient();

/**
 * Create a new API client instance with custom configuration
 * Useful for testing or special cases
 */
export const createApiClient = (config?: Partial<ApiClientConfig>): ApiClient => {
  return new ApiClient(config);
};

/**
 * Helper to create tenant-scoped API client
 * Automatically injects tenantId into all requests
 */
export const createTenantApiClient = (tenantId: string): ApiClient => {
  return new ApiClient({ tenantId });
};
