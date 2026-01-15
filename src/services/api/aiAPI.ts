import apiClient from './config';
import {
  DepartureEstimationRequest,
  DepartureEstimationResponse,
  TrafficPredictionResponse,
  AttractionRecommendationRequest,
  AttractionRecommendationResponse,
  TouristGuideRequest,
  TouristGuideResponse,
  TourismSuggestionResponse,
  TravelPatternRequest,
  TravelPatternResponse
} from '../../types';

// AI API Service
const aiAPI = {
  // Estimate optimal departure windows
  async estimateDeparture(data: DepartureEstimationRequest): Promise<DepartureEstimationResponse> {
    const response = await apiClient.post<DepartureEstimationResponse>('/api/ai/estimate-departure', data);
    return response.data;
  },

  // Get traffic prediction for a route
  async getTrafficPrediction(routeId: string): Promise<TrafficPredictionResponse> {
    const response = await apiClient.get<TrafficPredictionResponse>(`/api/ai/traffic-prediction/${routeId}`);
    return response.data;
  },

  // Get attraction recommendations
  async recommendAttractions(data: AttractionRecommendationRequest): Promise<AttractionRecommendationResponse> {
    const response = await apiClient.post<AttractionRecommendationResponse>('/api/ai/recommend-attractions', data);
    return response.data;
  },

  // Get AI tourist guide for an attraction
  async getTouristGuide(attractionId: string, data: TouristGuideRequest): Promise<TouristGuideResponse> {
    const response = await apiClient.post<TouristGuideResponse>(`/api/ai/tourist-guide/${attractionId}`, data);
    return response.data;
  },

  // Get tourism suggestions for a city
  async getTourismSuggestions(cityId: string): Promise<TourismSuggestionResponse> {
    const response = await apiClient.get<TourismSuggestionResponse>(`/api/ai/tourism-suggestions/${cityId}`);
    return response.data;
  },

  // Analyze travel patterns
  async analyzeTravelPattern(data: TravelPatternRequest): Promise<TravelPatternResponse> {
    const response = await apiClient.post<TravelPatternResponse>('/api/ai/analyze-travel-pattern', data);
    return response.data;
  },
};

export default aiAPI;
