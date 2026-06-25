import api from './api';
import type { Competition, CompetitionDetail, Result } from '../types';

export const getCompetitions = async (params?: { type?: string; status?: string; coach_assigned?: string }): Promise<Competition[]> => {
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

export const addResult = async (competitionId: number, data: Omit<Result, 'id' | 'athlete_name' | 'competition' | 'competition_name' | 'competition_date'>): Promise<Result> => {
  const response = await api.post(`/competitions/${competitionId}/results/`, data);
  return response.data;
};

// ── Coach / Athlete assignment ──────────────────────────────────────────

export const getCompetitionCoaches = async (id: number): Promise<import('../types').CompetitionCoach[]> => {
  const response = await api.get(`/competitions/${id}/coaches/`);
  return response.data;
};

export const addCompetitionCoach = async (competitionId: number, staffMemberId: number): Promise<void> => {
  await api.post(`/competitions/${competitionId}/coaches/`, { staff_member_id: staffMemberId });
};

export const getCompetitionAthletes = async (id: number): Promise<import('../types').CompetitionAthlete[]> => {
  const response = await api.get(`/competitions/${id}/athletes/`);
  return response.data;
};

export const addCompetitionAthlete = async (competitionId: number, athleteId: number, status = 'invited'): Promise<void> => {
  await api.post(`/competitions/${competitionId}/athletes/`, { athlete_id: athleteId, status });
};

export const removeCompetitionAthlete = async (competitionId: number, athleteId: number): Promise<void> => {
  await api.delete(`/competitions/${competitionId}/athletes/`, { data: { athlete_id: athleteId } });
};

export const respondToCompetition = async (competitionId: number, action: 'accept' | 'decline'): Promise<import('../types').CompetitionAthlete> => {
  const response = await api.post(`/competitions/${competitionId}/respond/`, { action });
  return response.data;
};
