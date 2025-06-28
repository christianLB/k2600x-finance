import axios, { AxiosInstance, AxiosError } from 'axios';

// Define custom error classes for better error handling
export class StrapiError extends Error {
  details: any;
  status: number;

  constructor(message: string, status: number, details: any = {}) {
    super(message);
    this.name = 'StrapiError';
    this.status = status;
    this.details = details;
  }
}

export class StrapiValidationError extends StrapiError {
  constructor(message: string, details: any = {}) {
    super(message, 400, details);
    this.name = 'StrapiValidationError';
  }
}

export class StrapiForbiddenError extends StrapiError {
  constructor(message: string, details: any = {}) {
    super(message, 403, details);
    this.name = 'StrapiForbiddenError';
  }
}

export class StrapiNotFoundError extends StrapiError {
  constructor(message: string, details: any = {}) {
    super(message, 404, details);
    this.name = 'StrapiNotFoundError';
  }
}

export class StrapiService {
  private api: AxiosInstance;
  private apiUrl: string;
  private username: string;
  private password: string;
  private jwt: string | null = null;

  constructor() {
    this.apiUrl = process.env.STRAPI_API_URL || process.env.STRAPI_URL || 'http://localhost:1337';
    this.username = process.env.STRAPI_USER || '';
    this.password = process.env.STRAPI_PASSWORD || '';

    if (!this.apiUrl) {
      console.warn('STRAPI_API_URL/STRAPI_URL is not defined. Using default: http://localhost:1337');
    }
    if (!this.username || !this.password) {
      console.warn('STRAPI_USER/STRAPI_PASSWORD is not defined. Requests might fail if authentication is required.');
    }

    this.api = axios.create({
      baseURL: `${this.apiUrl}/api`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add JWT token
    this.api.interceptors.request.use(async (config) => {
      if (!this.jwt) {
        await this.authenticate();
      }
      if (this.jwt) {
        config.headers.Authorization = `Bearer ${this.jwt}`;
      }
      return config;
    });

    // Response interceptor for error handling and token refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response) {
          const { data, status } = error.response;
          const errorMessage = (data as any)?.error?.message || error.message;
          const errorDetails = (data as any)?.error?.details || {};

          // If 401, try to refresh token once
          if (status === 401 && this.jwt) {
            this.jwt = null;
            try {
              await this.authenticate();
              // Retry the original request
              const originalRequest = error.config;
              if (originalRequest && this.jwt) {
                originalRequest.headers.Authorization = `Bearer ${this.jwt}`;
                return this.api.request(originalRequest);
              }
            } catch (authError) {
              // If authentication fails, continue with the original error
            }
          }

          switch (status) {
            case 400:
              throw new StrapiValidationError(errorMessage, errorDetails);
            case 403:
              throw new StrapiForbiddenError(errorMessage, errorDetails);
            case 404:
              throw new StrapiNotFoundError(errorMessage, errorDetails);
            default:
              throw new StrapiError(errorMessage, status, errorDetails);
          }
        }
        throw new StrapiError(error.message, (error as any).response?.status || 500);
      }
    );
  }

  /**
   * Authenticate with Strapi and get JWT token
   * @private
   */
  private async authenticate(): Promise<void> {
    if (!this.username || !this.password) {
      throw new StrapiError('Authentication credentials not provided', 401);
    }

    try {
      const response = await axios.post(`${this.apiUrl}/api/auth/local`, {
        identifier: this.username,
        password: this.password,
      });
      
      this.jwt = response.data.jwt;
    } catch (error: any) {
      if (error.response) {
        const { data, status } = error.response;
        const errorMessage = data?.error?.message || data?.message || 'Authentication failed';
        throw new StrapiError(errorMessage, status);
      }
      throw new StrapiError('Authentication failed', 401);
    }
  }

  /**
   * Clear stored JWT token
   */
  public clearAuth(): void {
    this.jwt = null;
  }

  /**
   * Convert schema UID to Content API endpoint
   * @param uid Schema UID like 'api::client.client' or 'plugin::users-permissions.user'
   * @returns API endpoint like 'clients' or 'users'
   */
  private getContentApiEndpoint(uid: string): string {
    if (uid.startsWith('api::')) {
      // For api:: content types, extract the last part and pluralize
      const parts = uid.split('.');
      return parts[parts.length - 1] + 's';
    } else if (uid.startsWith('plugin::users-permissions.user')) {
      return 'users';
    } else if (uid.startsWith('plugin::')) {
      // For other plugins, extract the last part
      const parts = uid.split('.');
      return parts[parts.length - 1] + 's';
    }
    return uid;
  }

  /**
   * Fetches a collection of entries from Strapi.
   * @param contentType The schema UID of the content type (e.g., 'api::client.client').
   * @param params Query parameters (e.g., { populate: '*', filters: { title: '...' } }).
   * @returns A promise that resolves to the data array.
   */
  async find<T>(contentType: string, params?: object): Promise<{ data: T[], meta?: any }> {
    const endpoint = this.getContentApiEndpoint(contentType);
    const response = await this.api.get(`/${endpoint}`, { params });
    return response.data;
  }

  /**
   * Fetches a single entry from Strapi.
   * @param contentType The API ID of the content type.
   * @param id The ID of the entry.
   * @param params Query parameters.
   * @returns A promise that resolves to the single data object.
   */
  async findOne<T>(contentType: string, id: string | number, params?: object): Promise<T> {
    const endpoint = this.getContentApiEndpoint(contentType);
    const response = await this.api.get(`/${endpoint}/${id}`, { params });
    return response.data.data;
  }

  /**
   * Creates a new entry in Strapi.
   * @param contentType The API ID of the content type.
   * @param data The data for the new entry.
   * @returns A promise that resolves to the created data object.
   */
  async create<T>(contentType: string, data: object): Promise<T> {
    const endpoint = this.getContentApiEndpoint(contentType);
    const response = await this.api.post(`/${endpoint}`, { data });
    return response.data.data;
  }

  /**
   * Updates an existing entry in Strapi.
   * @param contentType The API ID of the content type.
   * @param id The ID of the entry to update.
   * @param data The updated data.
   * @returns A promise that resolves to the updated data object.
   */
  async update<T>(contentType: string, id: string | number, data: object): Promise<T> {
    const endpoint = this.getContentApiEndpoint(contentType);
    const response = await this.api.put(`/${endpoint}/${id}`, { data });
    return response.data.data;
  }

  /**
   * Deletes an entry from Strapi.
   * @param contentType The API ID of the content type.
   * @param id The ID of the entry to delete.
   * @returns A promise that resolves when the entry is deleted.
   */
  async delete(contentType: string, id: string | number): Promise<void> {
    const endpoint = this.getContentApiEndpoint(contentType);
    await this.api.delete(`/${endpoint}/${id}`);
  }

  /**
   * Fetches Strapi content type schemas.
   * @returns A promise that resolves to the schemas object.
   */
  async getSchemas(): Promise<any> {
    const response = await this.api.get('/content-type-builder/content-types');
    return response.data.data;
  }

  /**
   * Uploads a file to Strapi.
   * @param file The file to upload (e.g., from an HTML input element).
   * @param data Optional metadata for the file.
   * @returns A promise that resolves to the uploaded file data.
   */
  async uploadFile<T>(file: File, data?: object): Promise<T> {
    const formData = new FormData();
    formData.append('files', file);
    if (data) {
      formData.append('data', JSON.stringify(data));
    }

    const response = await this.api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data[0]; // Strapi upload returns an array of uploaded files
  }

  /**
   * Deletes a file from Strapi.
   * @param id The ID of the file to delete.
   * @returns A promise that resolves when the file is deleted.
   */
  async deleteFile(id: string | number): Promise<void> {
    await this.api.delete(`/upload/files/${id}`);
  }

  // Authentication methods will be added here as needed, potentially interacting with /auth endpoints
  // For now, assuming token is set via environment variable for API calls.
}

export const strapiService = new StrapiService();