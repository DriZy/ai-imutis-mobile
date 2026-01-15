import apiClient from './config';
import { 
  City, 
  Attraction,
  AttractionSearchRequest,
  AttractionSearchResponse,
  ApiResponse,
  PaginatedResponse,
  Review,
  SavedAttraction
} from '../../types';

// Tourism API Service
const tourismAPI = {
  // List all cities
  async getCities(): Promise<City[]> {
    const response = await apiClient.get<City[]>('/api/cities');
    return response.data || [];
  },

  // Get attractions by city
  async getAttractionsByCity(cityId: string): Promise<Attraction[]> {
    const response = await apiClient.get<Attraction[]>(`/api/cities/${cityId}/attractions`);
    return response.data || [];
  },

  // Get attraction details
  async getAttractionDetails(attractionId: string): Promise<Attraction> {
    const response = await apiClient.get<Attraction>(`/api/attractions/${attractionId}`);
    return response.data;
  },

  // Search attractions
  async searchAttractions(
    query: string, 
    cityId?: string, 
    category?: string,
    minRating?: number
  ): Promise<Attraction[]> {
    const request: AttractionSearchRequest = {
      query,
      city_id: cityId,
      category,
      min_rating: minRating,
    };
    const response = await apiClient.post<AttractionSearchResponse>('/api/attractions/search', request);
    return response.data.results || [];
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
