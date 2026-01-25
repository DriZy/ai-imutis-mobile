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
  TravelSummary
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

  // Get booking history
  async getBookingHistory(): Promise<{ bookings: Booking[] }> {
    // Mock implementation or real API call
    const response = await apiClient.get<{ bookings: Booking[] }>('/api/bookings/history');
    return response.data;
  },

  // Cancel booking
  async cancelBooking(bookingId: string): Promise<void> {
    await apiClient.post(`/api/bookings/${bookingId}/cancel`);
  },

  // Download ticket
  async downloadTicket(bookingId: string): Promise<string> {
    const response = await apiClient.get<{ url: string }>(`/api/bookings/${bookingId}/ticket`);
    return response.data.url;
  },
};

export default travelAPI;
