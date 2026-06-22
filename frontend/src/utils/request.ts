import axios, {
  type AxiosInstance,
  type AxiosResponse,
  type AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios';
import type { ApiResponse } from '@/types';

// Retry configuration
const MAX_RETRIES = 3;
const BASE_DELAY = 1000; // 1 second

interface RetryableConfig extends InternalAxiosRequestConfig {
  __retryCount?: number;
  __noRetry?: boolean;
}

function isRetryableError(error: AxiosError): boolean {
  // Network errors (no response)
  if (!error.response) {
    return error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK' || !error.code;
  }
  // Server errors (5xx)
  const status = error.response.status;
  return status >= 500 && status !== 501;
}

function getRetryDelay(retryCount: number): number {
  // Exponential backoff with jitter
  const exponentialDelay = BASE_DELAY * Math.pow(2, retryCount);
  const jitter = Math.random() * BASE_DELAY * 0.5;
  return exponentialDelay + jitter;
}

const request: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
request.interceptors.response.use(
  (response: AxiosResponse<ApiResponse<unknown>>) => {
    const { data } = response;
    // 后端返回 { success: true, data: ... } 格式
    // 兼容 { code: 0, data: ... } 格式
    if (data.code !== undefined && data.code !== 0) {
      return Promise.reject(new Error(data.message || '请求失败'));
    }
    if (data.success === false) {
      return Promise.reject(new Error(data.message || '请求失败'));
    }
    return response;
  },
  async (error: AxiosError) => {
    const config = error.config as RetryableConfig | undefined;

    // If no config or explicitly disabled retry, reject immediately
    if (!config || config.__noRetry) {
      return Promise.reject(error);
    }

    // Initialize retry count
    config.__retryCount = config.__retryCount ?? 0;

    // Check if we should retry
    if (
      config.__retryCount < MAX_RETRIES &&
      isRetryableError(error)
    ) {
      config.__retryCount += 1;
      const delay = getRetryDelay(config.__retryCount - 1);

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));

      return request(config);
    }

    // No more retries — handle specific errors
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default request;
