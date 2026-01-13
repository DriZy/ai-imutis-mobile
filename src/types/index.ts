// TypeScript Type Definitions for AI-IMUTIS Mobile App

// ===== Authentication Types =====
export interface AuthCredentials {
  email?: string;
  phoneNumber?: string;
  password: string;
}

export interface OTPData {
  phoneNumber: string;
  verificationId: string;
  code: string;
}

export interface User {
  uid: string;
  email?: string;
  phoneNumber?: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  photoURL?: string;
  preferredLanguage: 'en' | 'fr';
  notificationsEnabled: boolean;
  createdAt: Date;
  lastLogin: Date;
}

export interface UserProfile {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  profilePhoto?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
}

// Update Passenger to reflect form fields used across the app
export interface Passenger {
  id?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  age?: number;
  idNumber?: string;
  phoneNumber?: string;
  seatNumber?: number;
}

export interface UserPreferences {
  userId: string;
  language: 'en' | 'fr';
  currency: 'XAF' | 'USD' | 'EUR';
  notificationSettings: {
    pushEnabled: boolean;
    emailEnabled: boolean;
    smsEnabled: boolean;
    departureAlerts: boolean;
    promotions: boolean;
  };
  privacySettings: {
    shareLocation: boolean;
    shareActivity: boolean;
    dataCollection: boolean;
  };
  accessibility: {
    fontSize: 'small' | 'medium' | 'large';
    highContrast: boolean;
    voiceOverEnabled: boolean;
  };
}

// ===== Device & Location Types =====
export interface DeviceInfo {
  id: string;
  type: 'iPhone' | 'iPad' | 'Android Phone' | 'Android Tablet';
  model: string;
  os: string;
  osVersion: string;
  appVersion: string;
  fingerprint: string;
}

export interface LocationData {
  userId: string;
  deviceIP: string;
  latitude: number;
  longitude: number;
  accuracy: number; // meters
  timestamp: Date;
  activityType: 'traveling' | 'browsing' | 'idle';
}

export interface DeviceSession {
  sessionId: string;
  deviceType: 'iPhone' | 'Android';
  deviceOS: string;
  deviceIP: string;
  lastActivity: Date;
  isActive: boolean;
}

export interface SessionTracking {
  sessionId: string;
  userId: string;
  deviceIP: string;
  deviceInfo: DeviceInfo;
  loginTime: Date;
  lastActivity: Date;
  logoutTime?: Date;
  ipRotationDetected: boolean;
}

// ===== Travel/Mobility Types =====
export interface City {
  id: string;
  name: string;
  region: string;
  description: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  imageUrl: string;
  bestTimeToVisit: string;
}

export interface Route {
  id: string;
  origin: City;
  destination: City;
  distance: number; // km
  estimatedDuration?: number; // minutes
  originCoordinates?: { latitude: number; longitude: number };
  destinationCoordinates?: { latitude: number; longitude: number };
  routeGeometry?: string; // GeoJSON or encoded polyline
}

export interface SearchQuery {
  origin: City;
  destination: City;
  departureDate: Date;
  passengers: number;
  returnDate?: Date;
}

export interface DeparturePrediction {
  estimatedDepartureTime: Date;
  confidence: number; // 0-1
  factors: {
    trafficConditions: string;
    passengerLoadStatus: string;
    timeOfDay: string;
  };
}

export interface TrafficUpdate {
  routeSegmentId: string;
  status: 'light' | 'moderate' | 'heavy';
  speed: number; // km/h
  delay: number; // minutes
  lastUpdated: Date;
  description?: string;
}

export interface Trip {
  id: string;
  route: Route;
  departureTime: Date;
  estimatedArrivalTime: Date;
  departurePrediction: DeparturePrediction;
  vehicleType: 'minibus' | 'bus' | 'taxi';
  totalSeats: number;
  availableSeats: number;
  pricePerSeat: number;
  driverName: string;
  vehicleRegistration: string;
  currentTraffic?: TrafficUpdate;
  estimatedDuration?: number;
  driverRating?: number;
}



export interface Booking {
  id: string;
  userId: string;
  trip: Trip;
  passengers: Passenger[];
  bookingDate: Date;
  totalPrice: number;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  eTicketUrl?: string;
  paymentMethod: 'card' | 'momo' | 'orange_money';
  paymentStatus: 'completed' | 'pending' | 'failed';
}

export interface RealTimeUpdate {
  tripId: string;
  currentLocation: {
    latitude: number;
    longitude: number;
  };
  currentSpeed: number;
  estimatedArrival: Date;
  trafficStatus: 'light' | 'moderate' | 'heavy';
  departureWindowUpdate: {
    estimatedTime: Date;
    confidence: number;
  };
}

// ===== Tourism Types =====
export interface Attraction {
  id: string;
  cityId: string;
  name: string;
  category: 'restaurant' | 'hotel' | 'museum' | 'nature' | 'cultural' | 'shopping';
  description: string;
  imageUrls: string[];
  coordinates: {
    latitude: number;
    longitude: number;
  };
  rating: number; // 1-5
  reviews: Review[];
  openingHours: {
    monday: TimeRange;
    tuesday: TimeRange;
    wednesday: TimeRange;
    thursday: TimeRange;
    friday: TimeRange;
    saturday: TimeRange;
    sunday: TimeRange;
  };
  contactInfo: {
    phone?: string;
    email?: string;
    website?: string;
  };
  estimatedCost?: number;
  guidedTourAvailable: boolean;
}

export interface TimeRange {
  open: string; // HH:MM
  close: string; // HH:MM
  closed: boolean;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: Date;
  images?: string[];
}

export interface SavedAttraction {
  userId: string;
  attractionId: string;
  savedDate: Date;
  notes?: string;
}

// ===== Notification Types =====
export interface Notification {
  id: string;
  userId: string;
  type: 'trip_update' | 'booking_confirmation' | 'payment' | 'promotion' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  data?: Record<string, any>;
}

// ===== API Response Types =====
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ===== Redux State Types =====
export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

export interface TravelState {
  searchQuery: SearchQuery | null;
  searchResults: Trip[];
  selectedTrip: Trip | null;
  bookings: Booking[];
  isLoading: boolean;
  error: string | null;
}

export interface TourismState {
  cities: City[];
  attractions: Attraction[];
  selectedCity: City | null;
  selectedAttraction: Attraction | null;
  savedAttractions: SavedAttraction[];
  isLoading: boolean;
  error: string | null;
}

export interface LocationState {
  currentLocation: LocationData | null;
  deviceInfo: DeviceInfo | null;
  sessions: DeviceSession[];
  isTrackingEnabled: boolean;
  error: string | null;
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
}

export interface RootState {
  auth: AuthState;
  travel: TravelState;
  tourism: TourismState;
  location: LocationState;
  notifications: NotificationState;
}
