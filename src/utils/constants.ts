// Constants for AI-IMUTIS Mobile App

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'https://api.ai-imutis.com',
  TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
};

// Map Configuration (OpenStreetMap)
export const MAP_CONFIG = {
  DEFAULT_LATITUDE: 4.0511, // Douala, Cameroon
  DEFAULT_LONGITUDE: 9.7679,
  DEFAULT_ZOOM: 12,
  MARKER_SIZE: 40,
  OSM_TILE_URL: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  ATTRIBUTION: '© OpenStreetMap contributors',
};

// Location Tracking
export const LOCATION_CONFIG = {
  UPDATE_INTERVAL: 10000, // 10 seconds
  MINIMUM_DISTANCE: 10, // meters
  ACCURACY_THRESHOLD: 20, // meters
  TIMEOUT: 5000,
};

// Cache Configuration
export const CACHE_CONFIG = {
  ATTRACTIONS_TTL: 3600000, // 1 hour
  CITIES_TTL: 86400000, // 24 hours
  TRIPS_TTL: 300000, // 5 minutes
  USER_PROFILE_TTL: 3600000, // 1 hour
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
};

// Vehicle Types
export const VEHICLE_TYPES = {
  MINIBUS: 'minibus',
  BUS: 'bus',
  TAXI: 'taxi',
} as const;

// Attraction Categories
export const ATTRACTION_CATEGORIES = [
  { value: 'restaurant', label: 'Restaurants' },
  { value: 'hotel', label: 'Hotels' },
  { value: 'museum', label: 'Museums' },
  { value: 'nature', label: 'Nature' },
  { value: 'cultural', label: 'Cultural Sites' },
  { value: 'shopping', label: 'Shopping' },
] as const;

// Payment Methods
export const PAYMENT_METHODS = {
  CARD: 'card',
  MOMO: 'momo',
  ORANGE_MONEY: 'orange_money',
} as const;

// Languages
export const LANGUAGES = {
  EN: 'en',
  FR: 'fr',
} as const;

// Status Types
export const BOOKING_STATUS = {
  CONFIRMED: 'confirmed',
  PENDING: 'pending',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
} as const;

export const TRAFFIC_STATUS = {
  LIGHT: 'light',
  MODERATE: 'moderate',
  HEAVY: 'heavy',
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: '@ai_imutis_auth_token',
  USER_PROFILE: '@ai_imutis_user_profile',
  DEVICE_INFO: '@ai_imutis_device_info',
  CACHED_CITIES: '@ai_imutis_cached_cities',
  CACHED_ATTRACTIONS: '@ai_imutis_cached_attractions',
  OFFLINE_QUEUE: '@ai_imutis_offline_queue',
  LANGUAGE_PREFERENCE: '@ai_imutis_language',
};

// Notification Types
export const NOTIFICATION_TYPES = {
  TRIP_UPDATE: 'trip_update',
  BOOKING_CONFIRMATION: 'booking_confirmation',
  PAYMENT: 'payment',
  PROMOTION: 'promotion',
  SYSTEM: 'system',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network connection error. Please check your internet.',
  AUTHENTICATION_FAILED: 'Authentication failed. Please login again.',
  LOCATION_PERMISSION_DENIED: 'Location permission is required for this feature.',
  BOOKING_FAILED: 'Booking failed. Please try again.',
  PAYMENT_FAILED: 'Payment failed. Please try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  BOOKING_CONFIRMED: 'Booking confirmed successfully!',
  PAYMENT_COMPLETED: 'Payment completed successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  ATTRACTION_SAVED: 'Attraction saved to favorites!',
};

// Regex Patterns
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[1-9]\d{1,14}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM DD, YYYY',
  FULL: 'MMMM DD, YYYY HH:mm',
  TIME: 'HH:mm',
  SHORT_DATE: 'MM/DD/YYYY',
};
