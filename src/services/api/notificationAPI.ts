import apiClient from './config';
import { Notification } from '../../types';

const notificationAPI = {
  async getNotifications(): Promise<{ notifications: Notification[] }> {
    const response = await apiClient.get('/api/notifications');
    // Backend returns plain NotificationList, not wrapped in ApiResponse
    return response.data || { notifications: [] };
  },

  async markAsRead(notificationId: string): Promise<void> {
    // Backend dismiss endpoint uses DELETE and marks as read
    await apiClient.delete(`/api/notifications/${notificationId}`);
  },

  async deleteNotification(notificationId: string): Promise<void> {
    await apiClient.delete(`/api/notifications/${notificationId}`);
  },

  async markAllAsRead(): Promise<void> {
    const resp = await notificationAPI.getNotifications();
    const ids = resp.notifications.map(n => n.id);
    await Promise.all(ids.map(id => apiClient.delete(`/api/notifications/${id}`)));
  },

  async deleteAllNotifications(): Promise<void> {
    const resp = await notificationAPI.getNotifications();
    const ids = resp.notifications.map(n => n.id);
    await Promise.all(ids.map(id => apiClient.delete(`/api/notifications/${id}`)));
  },
};

export default notificationAPI;
