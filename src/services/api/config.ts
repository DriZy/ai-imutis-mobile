import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, STORAGE_KEYS } from '../../utils/constants';
import { getDeviceInfo } from '../location/deviceInfoService';

// Create Axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor - Add authentication token and device IP
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // Get auth token
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Get device info and IP
      const deviceInfo = await getDeviceInfo();
      if (deviceInfo) {
        config.headers['X-Device-ID'] = deviceInfo.id;
        config.headers['X-Device-Type'] = deviceInfo.type;
        config.headers['X-Device-OS'] = `${deviceInfo.os} ${deviceInfo.osVersion}`;
        config.headers['X-Device-IP'] = deviceInfo.currentIP || 'unknown';
        config.headers['X-App-Version'] = deviceInfo.appVersion;
      }

      return config;
    } catch (error) {
      console.error('Request interceptor error:', error);
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor - Handle errors and token refresh
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized - Token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Clear auth token and redirect to login
      await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);

      // Emit error for UI
      import('../../utils/events/EventEmitter').then(({ eventEmitter, EVENTS }) => {
        eventEmitter.emit(EVENTS.API_ERROR, 'Session expired. Please login again.');
      });

      return Promise.reject(error);
    }

    // Handle other errors
    let errorMessage = 'An unexpected error occurred';

    if (error.response) {
      // Server responded with error status
      errorMessage = (error.response.data as any)?.message || 'Server error occurred';
    } else if (error.request) {
      // Request made but no response
      errorMessage = 'Network connection error. Please check your internet.';
    } else {
      // Something else happened
      errorMessage = (error as Error).message;
    }

    // Emit event for global toast
    // Dynamic import to avoid circular dependency issues if any
    import('../../utils/events/EventEmitter').then(({ eventEmitter, EVENTS }) => {
      eventEmitter.emit(EVENTS.API_ERROR, errorMessage);
    });

    console.error('API Error details:', errorMessage);
    return Promise.reject(new Error(errorMessage));
  }
);

export default apiClient;

// Helper function to set auth token
export const setAuthToken = async (token: string): Promise<void> => {
  await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
};

// Helper function to clear auth token
export const clearAuthToken = async (): Promise<void> => {
  await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
};

// Helper function for retry logic
export const retryRequest = async <T>(
  requestFn: () => Promise<T>,
  maxRetries: number = API_CONFIG.RETRY_ATTEMPTS
): Promise<T> => {
  let lastError: Error | null = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }
  }

  throw lastError;
};
