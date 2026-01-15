import apiClient from './config';
import {
  Notification,
  NotificationList,
  SubscribeNotificationRequest,
  MessageResponse
} from '../../types';

// Notification API Service
const notificationAPI = {
  // List notifications for the user
  async listNotifications(): Promise<Notification[]> {
    const response = await apiClient.get<NotificationList>('/api/notifications');
    return response.data.notifications || [];
  },

  // Subscribe to push notifications
  async subscribe(token: string, channels?: string[]): Promise<MessageResponse> {
    const request: SubscribeNotificationRequest = {
      token,
      channels,
    };
    const response = await apiClient.post<MessageResponse>('/api/notifications/subscribe', request);
    return response.data;
  },

  // Dismiss/mark notification as read
  async dismissNotification(notificationId: string): Promise<MessageResponse> {
    const response = await apiClient.delete<MessageResponse>(`/api/notifications/${notificationId}`);
    return response.data;
  },
};

export default notificationAPI;
