import axios from 'axios';
import { ERROR_CODES, resolveErrorCode } from './apiErrorCodes';

const DEFAULT_TIMEOUT = 10000;
const AUTH_STORAGE_KEY = 'resto_auth';
const LEGACY_AUTH_KEY = 'auth';
const API_BASE_URL =
  import.meta.env?.VITE_API_BASE_URL || 'https://amelieapp.alwaysdata.net/api';

const isBrowser =
  typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const AUTH_LOGOUT_EVENT = 'auth:logout';
const API_ERROR_EVENT = 'api:error';

class ApiClient {
  constructor(baseURL = API_BASE_URL) {
    this.instance = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: DEFAULT_TIMEOUT,
    });

    this.authToken = null;
    this.setupInterceptors();
  }

  setupInterceptors() {
    this.instance.interceptors.request.use(
      (config) => {
        const token = this.authToken || this.getStoredToken();

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
      },
      (error) => Promise.reject(error),
    );

    this.instance.interceptors.response.use(
      (response) => response,
      (error) => Promise.reject(this.handleError(error)),
    );
  }

  setAuthToken(token) {
    this.authToken = token || null;
  }

  clearAuthToken() {
    this.authToken = null;
  }

  getStoredToken() {
    if (!isBrowser) {
      return null;
    }

    const storedAuth =
      window.localStorage.getItem(AUTH_STORAGE_KEY) ||
      window.localStorage.getItem(LEGACY_AUTH_KEY);

    if (!storedAuth) {
      return null;
    }

    try {
      const parsed = JSON.parse(storedAuth);
      return parsed?.token || null;
    } catch (error) {
      console.error('Error parsing auth storage:', error);
      return null;
    }
  }

  clearStoredAuth() {
    if (!isBrowser) return;

    window.localStorage.removeItem(AUTH_STORAGE_KEY);
  }

  dispatchLogout(detail) {
    if (!isBrowser) return;

    window.dispatchEvent(
      new CustomEvent(AUTH_LOGOUT_EVENT, {
        detail,
      }),
    );
  }

  dispatchError(detail) {
    if (!isBrowser) return;

    window.dispatchEvent(
      new CustomEvent(API_ERROR_EVENT, {
        detail,
      }),
    );
  }

  handleError(error) {
    const status = error?.response?.status;
    const responseData = error?.response?.data;

    const message =
      responseData?.message ||
      responseData?.error ||
      error?.message ||
      'Error inesperado';

    const code = resolveErrorCode({
      code: responseData?.code,
      status,
      message,
    });

    const shouldForceLogout =
      status === 401 ||
      status === 419 ||
      (status === 403 && code === ERROR_CODES.SESSION_EXPIRED);

    if (shouldForceLogout) {
      this.clearAuthToken();
      this.clearStoredAuth();
      this.dispatchLogout({
        reason: code === ERROR_CODES.SESSION_EXPIRED ? code : ERROR_CODES.UNAUTHORIZED,
        status,
      });
    }

    if (!error.__API_ERROR_DISPATCHED__) {
      this.dispatchError({
        code,
        status,
        message,
        data: responseData,
      });
      Object.defineProperty(error, '__API_ERROR_DISPATCHED__', {
        value: true,
        enumerable: false,
      });
    }

    const apiError = new Error(message);
    apiError.code = code;
    apiError.status = status;
    apiError.data = responseData;
    apiError.response = error.response;
    apiError.originalError = error;

    return apiError;
  }

  async get(url, config) {
    const response = await this.instance.get(url, config);
    return response.data;
  }

  async post(url, data, config) {
    const response = await this.instance.post(url, data, config);
    return response.data;
  }

  async put(url, data, config) {
    const response = await this.instance.put(url, data, config);
    return response.data;
  }

  async patch(url, data, config) {
    const response = await this.instance.patch(url, data, config);
    return response.data;
  }

  async delete(url, config) {
    const response = await this.instance.delete(url, config);
    return response.data;
  }

  get defaults() {
    return this.instance.defaults;
  }
}

const apiClient = new ApiClient(API_BASE_URL);

export { ApiClient, ERROR_CODES, AUTH_LOGOUT_EVENT, API_ERROR_EVENT };
export default apiClient;
