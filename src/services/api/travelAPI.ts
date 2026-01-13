import apiClient from './config';
import { SearchQuery, Trip, Booking, Passenger, ApiResponse, PaginatedResponse } from '../../types';

// Travel API Service
const travelAPI = {
  // Search for trips
  async searchTrips(query: SearchQuery): Promise<Trip[]> {
    const response = await apiClient.post<ApiResponse<Trip[]>>('/api/travel/search', {
      originId: query.origin.id,
      destinationId: query.destination.id,
      departureDate: query.departureDate.toISOString(),
      passengers: query.passengers,
      returnDate: query.returnDate?.toISOString(),
    });
    return response.data.data || [];
  },

  // Get trip details by ID
  async getTripDetails(tripId: string): Promise<Trip> {
    const response = await apiClient.get<ApiResponse<Trip>>(`/api/travel/trips/${tripId}`);
    if (!response.data.data) {
      throw new Error('Trip not found');
    }
    return response.data.data;
  },

  // Create a booking
  async createBooking(
    tripId: string,
    passengers: Passenger[],
    paymentMethod: string
  ): Promise<Booking> {
    const response = await apiClient.post<ApiResponse<Booking>>('/api/travel/bookings', {
      tripId,
      passengers,
      paymentMethod,
    });
    if (!response.data.data) {
      throw new Error('Booking failed');
    }
    return response.data.data;
  },

  // Get user bookings
  async getBookings(page: number = 1, pageSize: number = 20): Promise<PaginatedResponse<Booking>> {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Booking>>>(
      '/api/travel/bookings',
      {
        params: { page, pageSize },
      }
    );
    return response.data.data || { items: [], total: 0, page: 1, pageSize: 20, hasMore: false };
  },

  // Get booking details
  async getBookingDetails(bookingId: string): Promise<Booking> {
    const response = await apiClient.get<ApiResponse<Booking>>(
      `/api/travel/bookings/${bookingId}`
    );
    if (!response.data.data) {
      throw new Error('Booking not found');
    }
    return response.data.data;
  },

  // Cancel booking
  async cancelBooking(bookingId: string): Promise<void> {
    await apiClient.post(`/api/travel/bookings/${bookingId}/cancel`);
  },

  // Get real-time trip updates (WebSocket alternative: long polling)
  async getTripUpdates(tripId: string) {
    const response = await apiClient.get(`/api/travel/trips/${tripId}/updates`);
    return response.data.data;
  },

  // Get available routes/cities
  async getCities() {
    const response = await apiClient.get('/api/travel/cities');
    return response.data.data || [];
  },
};

export default travelAPI;
