import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, CACHE_CONFIG } from '../../utils/constants';

// Storage Service for managing AsyncStorage operations
const storageService = {
  // Generic get with JSON parsing
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Error getting ${key} from storage:`, error);
      return null;
    }
  },

  // Generic set with JSON stringification
  async set(key: string, value: any): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting ${key} in storage:`, error);
    }
  },

  // Remove item
  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key} from storage:`, error);
    }
  },

  // Clear all storage
  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  },

  // Cache with TTL (Time To Live)
  async cacheWithTTL(key: string, value: any, ttl: number = CACHE_CONFIG.ATTRACTIONS_TTL): Promise<void> {
    try {
      const cacheItem = {
        data: value,
        timestamp: Date.now(),
        ttl,
      };
      await AsyncStorage.setItem(key, JSON.stringify(cacheItem));
    } catch (error) {
      console.error(`Error caching ${key}:`, error);
    }
  },

  // Get cached item with TTL check
  async getCached<T>(key: string): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      if (!value) return null;

      const cacheItem = JSON.parse(value);
      const now = Date.now();
      
      // Check if cache has expired
      if (now - cacheItem.timestamp > cacheItem.ttl) {
        await AsyncStorage.removeItem(key);
        return null;
      }

      return cacheItem.data as T;
    } catch (error) {
      console.error(`Error getting cached ${key}:`, error);
      return null;
    }
  },

  // Offline action queue
  async queueOfflineAction(action: any): Promise<void> {
    try {
      const queue = await this.get<any[]>(STORAGE_KEYS.OFFLINE_QUEUE) || [];
      queue.push({
        ...action,
        timestamp: Date.now(),
      });
      await this.set(STORAGE_KEYS.OFFLINE_QUEUE, queue);
    } catch (error) {
      console.error('Error queueing offline action:', error);
    }
  },

  // Get offline actions
  async getOfflineQueue(): Promise<any[]> {
    return await this.get<any[]>(STORAGE_KEYS.OFFLINE_QUEUE) || [];
  },

  // Clear offline queue
  async clearOfflineQueue(): Promise<void> {
    await this.remove(STORAGE_KEYS.OFFLINE_QUEUE);
  },
};

export default storageService;
