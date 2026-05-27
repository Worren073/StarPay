import api from './api';
import type { AuthTokens, User } from '../types';

export const login = async (email: string, password: string): Promise<AuthTokens> => {
  const response = await api.post('/auth/login/', { email, password });
  return response.data;
};

export const register = async (data: {
  email: string;
  username: string;
  password: string;
  role?: string;
  phone?: string;
}): Promise<{ user: User; message: string }> => {
  const response = await api.post('/auth/register/', data);
  return response.data;
};

export const getProfile = async (): Promise<User> => {
  const response = await api.get('/auth/me/');
  return response.data;
};

export const updateProfile = async (data: { username: string; phone: string }): Promise<User> => {
  const response = await api.put('/auth/me/', data);
  return response.data;
};
