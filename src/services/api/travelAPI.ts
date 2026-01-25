import apiClient from './config';
import { 
  SearchQuery, 
  Trip, 
  Booking, 
  ApiResponse,
  TravelSearchRequest,
  TravelSearchResponse,
  TravelDetail,
  TravelEstimateRequest,
  TravelEstimateResponse,
  TravelBookingRequest,
  TravelBookingResponse,
  TravelSummary,
  Vehicle,
  VehicleRegistrationRequest,
  VehicleRegistrationResponse,
  RideSchedule,
  RideScheduleCreateRequest,
  RideScheduleCreateResponse,
} from '../../types';

// Travel API Service
const travelAPI = {
  // List all available travels
  async listTravels(): Promise<TravelSummary[]> {
    const response = await apiClient.get<TravelSummary[]>('/api/travels');
    return response.data || [];
  },

  // Search for trips
  async searchTrips(query: SearchQuery): Promise<TravelSummary[]> {
    const request: TravelSearchRequest = {
      origin: query.origin.name.toLowerCase(),
      destination: query.destination.name.toLowerCase(),
      departure_date: query.departureDate,
      passengers: query.passengers,
    };
    const response = await apiClient.post<TravelSearchResponse>('/api/travels/search', request);
    return response.data.results || [];
  },

  // Get trip details by route ID
  async getTripDetails(routeId: string): Promise<TravelDetail> {
    const response = await apiClient.get<TravelDetail>(`/api/travels/${routeId}`);
    return response.data;
  },

  // Estimate departure windows
  async estimateDeparture(routeId: string, departureDate: string, passengers?: number): Promise<TravelEstimateResponse> {
    const request: TravelEstimateRequest = {
      route_id: routeId,
      departure_date: departureDate,
      passengers: passengers || 1,
    };
    const response = await apiClient.post<TravelEstimateResponse>('/api/travels/estimate', request);
    return response.data;
  },

  // Book travel
  async bookTravel(routeId: string, passengers: number, paymentMethod: string, specialRequests?: string): Promise<TravelBookingResponse> {
    const request: TravelBookingRequest = {
      route_id: routeId,
      passengers,
      payment_method: paymentMethod,
      special_requests: specialRequests,
    };
    const response = await apiClient.post<TravelBookingResponse>('/api/travels/book', request);
    return response.data;
  },

  // Register a vehicle with minimal data and optional photo upload
  async registerVehicle(payload: VehicleRegistrationRequest, photoUri?: string): Promise<VehicleRegistrationResponse> {
    const formData = new FormData();
    formData.append('type', payload.type);
    formData.append('plate_number', payload.plate_number);
    formData.append('seats', String(payload.seats));
    if (payload.make) formData.append('make', payload.make);
    if (payload.model) formData.append('model', payload.model);
    if (payload.color) formData.append('color', payload.color);

    if (photoUri) {
      formData.append('photo', {
        uri: photoUri,
        name: `vehicle-${Date.now()}.jpg`,
        type: 'image/jpeg',
      } as any); // React Native FormData expects file-like object
    }

    const response = await apiClient.post<VehicleRegistrationResponse>(
      '/api/vehicles/register',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return response.data;
  },

  // List vehicles for the authenticated user
  async getMyVehicles(): Promise<Vehicle[]> {
    const response = await apiClient.get<Vehicle[]>('/api/vehicles/mine');
    return response.data || [];
  },

  // Create a ride schedule for a vehicle
  async createRideSchedule(payload: RideScheduleCreateRequest): Promise<RideScheduleCreateResponse> {
    const response = await apiClient.post<RideScheduleCreateResponse>('/api/rides/schedules', payload);
    return response.data;
  },

  // List ride schedules created by the authenticated user
  async getMyRideSchedules(): Promise<RideSchedule[]> {
    const response = await apiClient.get<RideSchedule[]>('/api/rides/schedules/mine');
    return response.data || [];
  },
};

export default travelAPI;
