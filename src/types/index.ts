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

export interface UpdateUserProfileRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  profilePhoto?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
}

export interface UserPreferenceRequest {
  language?: 'en' | 'fr';
  currency?: 'XAF' | 'USD' | 'EUR';
  notificationSettings?: {
    pushEnabled?: boolean;
    emailEnabled?: boolean;
    smsEnabled?: boolean;
    departureAlerts?: boolean;
    promotions?: boolean;
  };
  privacySettings?: {
    shareLocation?: boolean;
    shareActivity?: boolean;
    dataCollection?: boolean;
  };
  accessibility?: {
    fontSize?: 'small' | 'medium' | 'large';
    highContrast?: boolean;
    voiceOverEnabled?: boolean;
  };
}

export interface LocationTrackRequest {
  latitude: number;
  longitude: number;
  accuracy: number;
  activityType: 'traveling' | 'browsing' | 'idle';
}

export interface LocationTrackResponse {
  success: boolean;
  message: string;
}

export interface VerifyTokenResponse {
  valid: boolean;
  user?: User;
  message?: string;
}

export interface DeviceSessionList {
  sessions: DeviceSession[];
}

export interface MessageResponse {
  success: boolean;
  message: string;
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
  country?: string;
  description?: string;
  population?: number;
}

export interface Route {
  id: string;
  origin: City;
  destination: City;
  distance: number; // km
  estimatedDuration: number; // minutes
  routeGeometry?: string; // GeoJSON or encoded polyline
}

export interface SearchQuery {
  origin: City;
  destination: City;
  departureDate: string; // ISO string format for Redux serialization
  passengers: number;
  returnDate?: string; // ISO string format for Redux serialization
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
}

export interface Passenger {
  id?: string;
  name?: string; // Full name
  firstName?: string;
  lastName?: string;
  email?: string; // Contact email
  age?: number;
  idNumber?: string;
  phoneNumber?: string;
  seatNumber?: number;
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
  vehicles: Vehicle[];
  rideSchedules: RideSchedule[];
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

// ===== API Request/Response Types =====

// Travel API Types
export interface TravelSearchRequest {
  origin: string;
  destination: string;
  departure_date: string;
  passengers?: number;
}

export interface TravelSearchResponse {
  results: TravelSummary[];
}

export interface TravelSummary {
  id: string;
  origin: string;
  destination: string;
  departure_time: string;
  estimated_arrival: string;
  available_seats: number;
  price_per_seat: number;
  confidence: number;
}

export interface TravelDetail {
  id: string;
  origin: string;
  destination: string;
  departure_time: string;
  estimated_arrival: string;
  available_seats: number;
  price_per_seat: number;
  confidence: number;
  route_geometry?: string;
  distance_km?: number;
  duration_minutes?: number;
  amenities?: string[];
  departurePrediction?: DeparturePrediction;
  currentTraffic?: TrafficUpdate;
}

export interface TravelEstimateRequest {
  route_id: string;
  departure_date: string;
  passengers?: number;
  user_preferences?: Record<string, any>;
}

export interface TravelEstimateResponse {
  route_id: string;
  windows: DepartureWindow[];
  notes?: string;
}

export interface DepartureWindow {
  label: string;
  confidence: number;
  recommended?: boolean;
}

export interface TravelBookingRequest {
  route_id: string;
  passengers?: number;
  payment_method: string;
  special_requests?: string;
}

export interface TravelBookingResponse {
  booking_id: string;
  status: string;
  departure_time: string;
  estimated_arrival: string;
}

// Tourism API Types
export interface AttractionSearchRequest {
  query: string;
  city_id?: string;
  category?: string;
  min_rating?: number;
}

export interface AttractionSearchResponse {
  results: Attraction[];
}

// User API Types
export interface ApiUpdateUserProfileRequest {
  display_name?: string;
  language?: string;
  notification_enabled?: boolean;
}

export interface ApiUserPreferenceRequest {
  language?: string;
  marketing_opt_in?: boolean;
  travel_notifications?: boolean;
  security_alerts?: boolean;
}

export interface ApiLocationTrackRequest {
  latitude: number;
  longitude: number;
  accuracy_meters?: number;
  activity_type?: string;
}

export interface ApiLocationTrackResponse {
  location_id: string;
  device_ip: string;
  recorded_at: string;
}

export interface ApiVerifyTokenResponse {
  uid: string;
  role: string;
  status?: string;
}

export interface ApiDeviceSessionList {
  sessions: DeviceSession[];
}

export interface ApiMessageResponse {
  message: string;
}

// Notification API Types
export interface NotificationList {
  notifications: Notification[];
}

export interface SubscribeNotificationRequest {
  token: string;
  channels?: string[];
}

// AI API Types
export interface DepartureEstimationRequest {
  route_id: string;
  current_time: string;
  user_preferences?: Record<string, any>;
}

export interface DepartureEstimationResponse {
  route_id: string;
  windows: AIDepatureWindow[];
  notes?: string;
}

export interface AIDepatureWindow {
  window: string;
  confidence: number;
  recommended?: boolean;
}

export interface TrafficPredictionResponse {
  route_id: string;
  congestion_score: number;
  average_speed_kmh: number;
  updated_at: string;
}

export interface AttractionRecommendationRequest {
  city_id: string;
  interests?: string[];
  max_results?: number;
}

export interface AttractionRecommendationResponse {
  recommendations: AttractionRecommendation[];
}

export interface AttractionRecommendation {
  attraction_id: string;
  name: string;
  score: number;
  reason?: string;
}

export interface TouristGuideRequest {
  language?: string;
  preferences?: Record<string, any>;
}

export interface TouristGuideResponse {
  attraction_id: string;
  guide: string;
  generated_at: string;
}

export interface TourismSuggestionResponse {
  city_id: string;
  suggestions: string[];
}

export interface TravelPatternRequest {
  route_id: string;
  recent_trips?: number;
}

export interface TravelPatternResponse {
  route_id: string;
  insights: TravelPatternInsight[];
  generated_at: string;
}

export interface TravelPatternInsight {
  trend: string;
  confidence: number;
  commentary: string;
}

// ===== Driver/Vehicle & Scheduling Types =====
export interface Vehicle {
  id: string;
  ownerId: string;
  type: 'minibus' | 'bus' | 'taxi';
  plateNumber: string;
  seats: number;
  make?: string;
  model?: string;
  color?: string;
  createdAt?: string;
}

export interface VehicleRegistrationRequest {
  type: 'minibus' | 'bus' | 'taxi';
  plate_number: string;
  seats: number;
  make?: string;
  model?: string;
  color?: string;
}

export interface VehicleRegistrationResponse {
  vehicle_id: string;
  status: 'created' | 'exists' | 'updated';
}

export interface RideSchedule {
  id: string;
  vehicleId: string;
  origin: string; // city name or code
  destination: string; // city name or code
  departure_time: string; // ISO datetime
  total_seats: number;
  available_seats: number;
  price_per_seat: number;
  notes?: string;
  createdAt?: string;
}

export interface RideScheduleCreateRequest {
  vehicle_id: string;
  origin: string;
  destination: string;
  departure_time: string;
  total_seats: number;
  price_per_seat: number;
  notes?: string;
}

export interface RideScheduleCreateResponse {
  schedule_id: string;
  status: 'created' | 'updated';
}

