import api from './api';
import type { StaffMember } from '../types';

export const getStaff = async (params?: {
  specialty?: string;
  status?: string;
  search?: string;
  ordering?: string;
}): Promise<StaffMember[]> => {
  const response = await api.get('/staff/', { params });
  return response.data;
};

export const getStaffMember = async (id: number): Promise<StaffMember> => {
  const response = await api.get(`/staff/${id}/`);
  return response.data;
};

export const createStaffMember = async (data: Omit<StaffMember, 'id' | 'created_at'>): Promise<StaffMember> => {
  const response = await api.post('/staff/', data);
  return response.data;
};

export const updateStaffMember = async (id: number, data: Partial<StaffMember>): Promise<StaffMember> => {
  const response = await api.patch(`/staff/${id}/`, data);
  return response.data;
};

export const deleteStaffMember = async (id: number): Promise<void> => {
  await api.delete(`/staff/${id}/`);
};
