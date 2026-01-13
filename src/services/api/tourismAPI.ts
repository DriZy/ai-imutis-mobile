import apiClient from './config';
import storageService from '../storage/storageService';
import { STORAGE_KEYS } from '../../utils/constants';
import { City, Attraction, Review, SavedAttraction, ApiResponse, PaginatedResponse } from '../../types';

// Tourism API Service - adapted to backend routes and local saved-attraction persistence
const tourismAPI = {
  // Get all cities (backend: /api/cities)
  async getCities(): Promise<City[]> {
    const response = await apiClient.get<ApiResponse<City[]>>('/api/cities');
    return response.data.data || [];
  },

  // Get city details (backend: /api/cities/:id)
  async getCityDetails(cityId: string): Promise<City> {
    const response = await apiClient.get<ApiResponse<City>>(`/api/cities/${cityId}`);
    if (!response.data.data) {
      throw new Error('City not found');
    }
    return response.data.data;
  },

  // Get attractions by city (backend: /api/cities/:id/attractions)
  async getAttractionsByCity(
    cityId: string,
    category?: string,
    page: number = 1
  ): Promise<PaginatedResponse<Attraction>> {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Attraction>>>(
      `/api/cities/${cityId}/attractions`,
      {
        params: { category, page, pageSize: 20 },
      }
    );
    return response.data.data || { items: [], total: 0, page: 1, pageSize: 20, hasMore: false };
  },

  // Search attractions (backend: /api/attractions/search)
  async searchAttractions(query: string, category?: string): Promise<Attraction[]> {
    const response = await apiClient.post<ApiResponse<any>>(
      '/api/attractions/search',
      { query, category }
    );
    // backend returns { results: Attraction[] } or { data: { results } }
    const payload = response.data.data || response.data;
    return payload?.results || [];
  },

  // Get attraction details (backend: /api/attractions/:id)
  async getAttractionDetails(attractionId: string): Promise<Attraction> {
    const response = await apiClient.get<ApiResponse<Attraction>>(`/api/attractions/${attractionId}`);
    if (!response.data.data) {
      throw new Error('Attraction not found');
    }
    return response.data.data;
  },

  // Get nearby attractions - not implemented on backend; return empty list on 404
  async getNearbyAttractions(latitude: number, longitude: number, radius: number = 5000): Promise<Attraction[]> {
    try {
      const response = await apiClient.get<ApiResponse<Attraction[]>>(
        '/api/attractions/nearby',
        {
          params: { latitude, longitude, radius },
        }
      );
      return response.data.data || [];
    } catch (err: any) {
      if (err.message && err.message.includes('Not Found')) return [];
      throw err;
    }
  },

  // Save attraction locally (backend has no saved-attractions endpoints)
  async saveAttraction(attractionId: string, notes?: string): Promise<SavedAttraction> {
    const current = (await storageService.get<SavedAttraction[]>(STORAGE_KEYS.CACHED_ATTRACTIONS)) || [];
    const entry: SavedAttraction = {
      userId: 'local',
      attractionId,
      savedDate: new Date(),
      notes,
    };
    const updated = [entry, ...current.filter(c => c.attractionId !== attractionId)];
    await storageService.set(STORAGE_KEYS.CACHED_ATTRACTIONS, updated);
    return entry;
  },

  // Get saved attractions from local storage
  async getSavedAttractions(): Promise<SavedAttraction[]> {
    return (await storageService.get<SavedAttraction[]>(STORAGE_KEYS.CACHED_ATTRACTIONS)) || [];
  },

  // Remove saved attraction locally
  async removeSavedAttraction(attractionId: string): Promise<void> {
    const current = (await storageService.get<SavedAttraction[]>(STORAGE_KEYS.CACHED_ATTRACTIONS)) || [];
    const updated = current.filter(c => c.attractionId !== attractionId);
    await storageService.set(STORAGE_KEYS.CACHED_ATTRACTIONS, updated);
  },

  // Get attraction reviews - backend does not expose a dedicated reviews endpoint in demo; return embedded attraction.reviews
  async getReviews(attractionId: string, page: number = 1): Promise<PaginatedResponse<Review>> {
    try {
      const attraction = await tourismAPI.getAttractionDetails(attractionId);
      const items = attraction.reviews || [];
      return { items, total: items.length, page: 1, pageSize: 10, hasMore: false };
    } catch (err) {
      return { items: [], total: 0, page: 1, pageSize: 10, hasMore: false };
    }
  },

  // Submit a review - demo: return created review locally (no backend persistence)
  async submitReview(attractionId: string, rating: number, comment: string, images?: string[]): Promise<Review> {
    const review: Review = {
      id: `rv-${Date.now()}`,
      userId: 'local',
      userName: 'You',
      rating,
      comment,
      date: new Date(),
      images: images || [],
    };
    // Note: not persisted to backend in demo mode
    return review;
  },
};

export default tourismAPI;
