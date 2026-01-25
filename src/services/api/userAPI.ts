import apiClient from './config';
import {
  UserProfile,
  UserPreferences,
  DeviceSession,
  ApiUpdateUserProfileRequest as UpdateUserProfileRequest,
  ApiUserPreferenceRequest as UserPreferenceRequest,
  ApiLocationTrackRequest as LocationTrackRequest,
  ApiLocationTrackResponse as LocationTrackResponse,
  ApiVerifyTokenResponse as VerifyTokenResponse,
  ApiDeviceSessionList as DeviceSessionList,
  ApiMessageResponse as MessageResponse
} from '../../types';

// User API Service
const userAPI = {
  // Verify authentication token
  async verifyToken(): Promise<VerifyTokenResponse> {
    const response = await apiClient.post<VerifyTokenResponse>('/api/auth/verify-token');
    return response.data;
  },

  // Get user profile
  async getProfile(): Promise<UserProfile> {
    const response = await apiClient.get<UserProfile>('/api/users/profile');
    return response.data;
  },

  // Update user profile
  async updateProfile(data: UpdateUserProfileRequest): Promise<UserProfile> {
    const response = await apiClient.put<UserProfile>('/api/users/profile', data);
    return response.data;
  },

  // Delete account
  async deleteAccount(): Promise<MessageResponse> {
    const response = await apiClient.delete<MessageResponse>('/api/users/account');
    return response.data;
  },

  // Save user preferences
  async savePreferences(preferences: UserPreferenceRequest): Promise<MessageResponse> {
    const response = await apiClient.post<MessageResponse>('/api/users/preferences', preferences);
    return response.data;
  },

  // Get active sessions
  async getSessions(): Promise<DeviceSession[]> {
    const response = await apiClient.get<DeviceSessionList>('/api/users/sessions');
    return response.data.sessions || [];
  },

  // Revoke a session
  async revokeSession(sessionId: string): Promise<MessageResponse> {
    const response = await apiClient.delete<MessageResponse>(`/api/users/sessions/${sessionId}`);
    return response.data;
  },

  // Track user location
  async trackLocation(data: LocationTrackRequest): Promise<LocationTrackResponse> {
    const response = await apiClient.post<LocationTrackResponse>('/api/users/locations/track', data);
    return response.data;
  },
};

export default userAPI;
