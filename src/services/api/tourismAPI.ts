import apiClient from './config';
import { City, Attraction, Review, SavedAttraction, ApiResponse, PaginatedResponse } from '../../types';

// Tourism API Service
const tourismAPI = {
  // Get all cities
  async getCities(): Promise<City[]> {
    const response = await apiClient.get<ApiResponse<City[]>>('/api/tourism/cities');
    return response.data.data || [];
  },

  // Get city details
  async getCityDetails(cityId: string): Promise<City> {
    const response = await apiClient.get<ApiResponse<City>>(`/api/tourism/cities/${cityId}`);
    if (!response.data.data) {
      throw new Error('City not found');
    }
    return response.data.data;
  },

  // Get attractions by city
  async getAttractionsByCity(
    cityId: string,
    category?: string,
    page: number = 1
  ): Promise<PaginatedResponse<Attraction>> {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Attraction>>>(
      `/api/tourism/cities/${cityId}/attractions`,
      {
        params: { category, page, pageSize: 20 },
      }
    );
    return response.data.data || { items: [], total: 0, page: 1, pageSize: 20, hasMore: false };
  },

  // Search attractions
  async searchAttractions(query: string, category?: string): Promise<Attraction[]> {
    const response = await apiClient.get<ApiResponse<Attraction[]>>(
      '/api/tourism/attractions/search',
      {
        params: { q: query, category },
      }
    );
    return response.data.data || [];
  },

  // Get attraction details
  async getAttractionDetails(attractionId: string): Promise<Attraction> {
    const response = await apiClient.get<ApiResponse<Attraction>>(
      `/api/tourism/attractions/${attractionId}`
    );
    if (!response.data.data) {
      throw new Error('Attraction not found');
    }
    return response.data.data;
  },

  // Get nearby attractions
  async getNearbyAttractions(latitude: number, longitude: number, radius: number = 5000): Promise<Attraction[]> {
    const response = await apiClient.get<ApiResponse<Attraction[]>>(
      '/api/tourism/attractions/nearby',
      {
        params: { latitude, longitude, radius },
      }
    );
    return response.data.data || [];
  },

  // Save attraction to favorites
  async saveAttraction(attractionId: string, notes?: string): Promise<SavedAttraction> {
    const response = await apiClient.post<ApiResponse<SavedAttraction>>(
      '/api/tourism/saved-attractions',
      {
        attractionId,
        notes,
      }
    );
    if (!response.data.data) {
      throw new Error('Failed to save attraction');
    }
    return response.data.data;
  },

  // Get saved attractions
  async getSavedAttractions(): Promise<SavedAttraction[]> {
    const response = await apiClient.get<ApiResponse<SavedAttraction[]>>(
      '/api/tourism/saved-attractions'
    );
    return response.data.data || [];
  },

  // Remove saved attraction
  async removeSavedAttraction(attractionId: string): Promise<void> {
    await apiClient.delete(`/api/tourism/saved-attractions/${attractionId}`);
  },

  // Get attraction reviews
  async getReviews(attractionId: string, page: number = 1): Promise<PaginatedResponse<Review>> {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Review>>>(
      `/api/tourism/attractions/${attractionId}/reviews`,
      {
        params: { page, pageSize: 10 },
      }
    );
    return response.data.data || { items: [], total: 0, page: 1, pageSize: 10, hasMore: false };
  },

  // Submit a review
  async submitReview(attractionId: string, rating: number, comment: string, images?: string[]): Promise<Review> {
    const response = await apiClient.post<ApiResponse<Review>>(
      `/api/tourism/attractions/${attractionId}/reviews`,
      {
        rating,
        comment,
        images,
      }
    );
    if (!response.data.data) {
      throw new Error('Failed to submit review');
    }
    return response.data.data;
  },
};

export default tourismAPI;
