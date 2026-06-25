import api from './api';
import type { Athlete, AthleteProgress, AthleteProfile, AthletePlan, Invoice, CompetitionAthlete, Plan, Result } from '../types';

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

export const createAthlete = async (data: Omit<Athlete, 'id' | 'created_at' | 'updated_at' | 'coach_names' | 'plan_status' | 'days_remaining'>): Promise<Athlete> => {
  const response = await api.post('/athletes/', data);
  return response.data;
};

export const updateAthlete = async (id: number, data: Partial<Athlete>): Promise<Athlete> => {
  const response = await api.patch(`/athletes/${id}/`, data);
  return response.data;
};

export const deleteAthlete = async (id: number): Promise<void> => {
  await api.delete(`/athletes/${id}/`);
};

export const createAthleteProgress = async (athleteId: number, data: {
  speed_score: number;
  technique_score: number;
  form_score: number;
}): Promise<AthleteProgress> => {
  const response = await api.post(`/athletes/${athleteId}/progress/`, data);
  return response.data;
};

export const getAthleteProgress = async (athleteId: number): Promise<AthleteProgress[]> => {
  const response = await api.get(`/athletes/${athleteId}/progress/`);
  return response.data;
};

export const getMyProfile = async (): Promise<AthleteProfile> => {
  const response = await api.get('/athletes/me/profile/');
  return response.data;
};

export const getMyProgress = async (): Promise<AthleteProgress[]> => {
  const response = await api.get('/athletes/me/progress/');
  return response.data;
};

export const getMyPayments = async (): Promise<Invoice[]> => {
  const response = await api.get('/athletes/me/payments/');
  return response.data;
};

export const getMyResults = async (): Promise<Result[]> => {
  const response = await api.get('/athletes/me/results/');
  return response.data;
};

export const getMyCompetitions = async (): Promise<CompetitionAthlete[]> => {
  const response = await api.get('/athletes/me/competitions/');
  return response.data;
};

export const getMyPlan = async (): Promise<AthletePlan> => {
  const response = await api.get('/athletes/me/plan/');
  return response.data;
};

export const getAthletePlan = async (id: number): Promise<AthletePlan> => {
  const response = await api.get(`/athletes/${id}/plan/`);
  return response.data;
};

export const generateRenewalInvoice = async (athleteId: number): Promise<Invoice> => {
  const response = await api.post(`/athletes/${athleteId}/generate_renewal_invoice/`);
  return response.data;
};

export const changeAthletePlan = async (athleteId: number, planId: number): Promise<AthletePlan> => {
  const response = await api.patch(`/athletes/${athleteId}/change_plan/`, { plan_id: planId });
  return response.data;
};

export const getPlans = async (): Promise<Plan[]> => {
  const response = await api.get('/plans/');
  return response.data;
};
