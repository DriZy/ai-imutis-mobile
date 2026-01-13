import apiClient from './config';
import { SearchQuery, Trip, Booking, Passenger, ApiResponse, PaginatedResponse } from '../../types';

// Travel API Service
const travelAPI = {
  // Search for trips (backend expects origin/destination strings and departure_date)
  async searchTrips(query: SearchQuery): Promise<Trip[]> {
    const response = await apiClient.post<ApiResponse<any>>('/api/travels/search', {
      origin: query.origin.name,
      destination: query.destination.name,
      departure_date: query.departureDate.toISOString(),
      passengers: query.passengers,
      return_date: query.returnDate?.toISOString(),
    });
    const payload = response.data.data || response.data;
    return payload?.results || [];
  },


  // Get trip details by ID (backend: /api/travels/:id)
  async getTripDetails(tripId: string): Promise<Trip> {
    const response = await apiClient.get<ApiResponse<Trip>>(`/api/travels/${tripId}`);
    if (!response.data.data) {
      throw new Error('Trip not found');
    }
    return response.data.data;
  },


  // Create a booking (backend: /api/travels/book expects route_id and passengers number)
  async createBooking(
    routeId: string,
    passengers: Passenger[] | number,
    paymentMethod: string
  ): Promise<any> {
    const passengerCount = Array.isArray(passengers) ? passengers.length : passengers;
    const payload = {
      route_id: routeId,
      passengers: passengerCount,
      payment_method: paymentMethod,
    };
    const response = await apiClient.post('/api/travels/book', payload);
    // backend returns TravelBookingResponse
    return response.data.data || response.data;
  },


  // Get user bookings (backend: not available in demo; return empty on 404)
  async getBookings(page: number = 1, pageSize: number = 20): Promise<PaginatedResponse<Booking>> {
    try {
      const response = await apiClient.get<ApiResponse<PaginatedResponse<Booking>>>(
        '/api/travels/bookings',
        {
          params: { page, pageSize },
        }
      );
      return response.data.data || { items: [], total: 0, page: 1, pageSize: 20, hasMore: false };
    } catch (err: any) {
      if (err.message && err.message.includes('Not Found')) {
        return { items: [], total: 0, page: 1, pageSize: 20, hasMore: false };
      }
      throw err;
    }
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

  // Get available travels/routes (backend: /api/travels)
  async getCities() {
    const response = await apiClient.get('/api/travels');
    return response.data.data || response.data || [];
  },


  // Get booking history (wrapper over bookings endpoint)
  async getBookingHistory(): Promise<Booking[]> {
    const response = await apiClient.get<ApiResponse<Booking[]>>('/api/travel/bookings');
    return response.data.data || [];
  },

  // Download ticket link for a booking
  async downloadTicket(bookingId: string): Promise<string> {
    const response = await apiClient.get<ApiResponse<{ url: string }>>(
      `/api/travel/bookings/${bookingId}/ticket`
    );
    return response.data.data?.url || '';
  },
};

export default travelAPI;
