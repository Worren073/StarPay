import api from './api';
import type { Competition, CompetitionDetail, Result } from '../types';

export const getCompetitions = async (params?: { type?: string; status?: string }): Promise<Competition[]> => {
  const response = await api.get('/competitions/', { params });
  return response.data;
};

export const getCompetition = async (id: number): Promise<CompetitionDetail> => {
  const response = await api.get(`/competitions/${id}/`);
  return response.data;
};

export const createCompetition = async (data: Omit<Competition, 'id' | 'created_at' | 'results_count'>): Promise<Competition> => {
  const response = await api.post('/competitions/', data);
  return response.data;
};

export const updateCompetition = async (id: number, data: Partial<Competition>): Promise<Competition> => {
  const response = await api.put(`/competitions/${id}/`, data);
  return response.data;
};

export const deleteCompetition = async (id: number): Promise<void> => {
  await api.delete(`/competitions/${id}/`);
};

export const getCompetitionResults = async (id: number): Promise<Result[]> => {
  const response = await api.get(`/competitions/${id}/results/`);
  return response.data;
};

export const addResult = async (competitionId: number, data: Omit<Result, 'id' | 'athlete_name'>): Promise<Result> => {
  const response = await api.post(`/competitions/${competitionId}/results/`, data);
  return response.data;
};
