import api from './api';
import type { Athlete } from '../types';

export const getAthletes = async (params?: {
  level?: string;
  status?: string;
  search?: string;
  ordering?: string;
}): Promise<Athlete[]> => {
  const response = await api.get('/athletes/', { params });
  return response.data;
};

export const getAthlete = async (id: number): Promise<Athlete> => {
  const response = await api.get(`/athletes/${id}/`);
  return response.data;
};

export const createAthlete = async (data: Omit<Athlete, 'id' | 'created_at' | 'updated_at' | 'coach_name'>): Promise<Athlete> => {
  const response = await api.post('/athletes/', data);
  return response.data;
};

export const updateAthlete = async (id: number, data: Partial<Athlete>): Promise<Athlete> => {
  const response = await api.put(`/athletes/${id}/`, data);
  return response.data;
};

export const deleteAthlete = async (id: number): Promise<void> => {
  await api.delete(`/athletes/${id}/`);
};
