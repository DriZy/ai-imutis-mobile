import apiClient from './config';
import { UserProfile, UserPreferences, DeviceSession, ApiResponse } from '../../types';

// User API Service
const userAPI = {
  // Get user profile
  async getProfile(): Promise<UserProfile> {
    const response = await apiClient.get<ApiResponse<UserProfile>>('/api/users/profile');
    if (!response.data.data) {
      throw new Error('Profile not found');
    }
    return response.data.data;
  },

  // Update user profile
  async updateProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
    const response = await apiClient.put<ApiResponse<UserProfile>>('/api/users/profile', profile);
    if (!response.data.data) {
      throw new Error('Failed to update profile');
    }
    return response.data.data;
  },

  // Get user preferences - backend may not implement GET; return empty/default on 404/405
  async getPreferences(): Promise<Partial<UserPreferences> | null> {
    try {
      const response = await apiClient.get<ApiResponse<UserPreferences>>('/api/users/preferences');
      return response.data.data || null;
    } catch (err: any) {
      if (err.message && (err.message.includes('Method Not Allowed') || err.message.includes('Not Found'))) {
        return null;
      }
      throw err;
    }
  },


  // Update user preferences (backend: POST /api/users/preferences returns MessageResponse)
  async updatePreferences(preferences: Partial<UserPreferences>): Promise<void> {
    await apiClient.post('/api/users/preferences', preferences);
  },


  // Get active sessions
  async getSessions(): Promise<DeviceSession[]> {
    const response = await apiClient.get<ApiResponse<DeviceSession[]>>('/api/users/sessions');
    return response.data.data || [];
  },

  // Revoke a session
  async revokeSession(sessionId: string): Promise<void> {
    await apiClient.delete(`/api/users/sessions/${sessionId}`);
  },

  // Track user location (backend: /api/users/locations/track)
  async trackLocation(locationData: {
    latitude: number;
    longitude: number;
    accuracy_meters?: number;
    activity_type?: string;
  }): Promise<void> {
    await apiClient.post('/api/users/locations/track', locationData);
  },


  // Delete account
  async deleteAccount(): Promise<void> {
    await apiClient.delete('/api/users/account');
  },
};

export default userAPI;
