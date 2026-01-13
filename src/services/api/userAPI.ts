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

  // Get user preferences
  async getPreferences(): Promise<UserPreferences> {
    const response = await apiClient.get<ApiResponse<UserPreferences>>('/api/users/preferences');
    if (!response.data.data) {
      throw new Error('Preferences not found');
    }
    return response.data.data;
  },

  // Update user preferences
  async updatePreferences(preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    const response = await apiClient.put<ApiResponse<UserPreferences>>(
      '/api/users/preferences',
      preferences
    );
    if (!response.data.data) {
      throw new Error('Failed to update preferences');
    }
    return response.data.data;
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

  // Track user location
  async trackLocation(locationData: {
    latitude: number;
    longitude: number;
    accuracy: number;
    deviceIP: string;
  }): Promise<void> {
    await apiClient.post('/api/users/location', locationData);
  },

  // Delete account
  async deleteAccount(): Promise<void> {
    await apiClient.delete('/api/users/account');
  },
};

export default userAPI;
