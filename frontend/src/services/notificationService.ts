import api from './api';
import type { Notification } from '../types';

export const getNotifications = async (params?: { is_read?: boolean }): Promise<Notification[]> => {
  const response = await api.get('/notifications/', { params });
  return response.data;
};

export const markAsRead = async (id: number): Promise<void> => {
  await api.post(`/notifications/${id}/mark_read/`);
};

export const markAllAsRead = async (): Promise<void> => {
  await api.post('/notifications/mark_all_read/');
};

export const getUnreadCount = async (): Promise<number> => {
  const response = await api.get('/notifications/unread_count/');
  return response.data.count;
};
