import api from './api';
import type { Invoice, Transaction, PaymentSummary } from '../types';

export const getInvoices = async (params?: { status?: string }): Promise<Invoice[]> => {
  const response = await api.get('/payments/invoices/', { params });
  return response.data;
};

export const getInvoice = async (id: number): Promise<Invoice> => {
  const response = await api.get(`/payments/invoices/${id}/`);
  return response.data;
};

export const createInvoice = async (data: Omit<Invoice, 'id' | 'created_at' | 'athlete_name'>): Promise<Invoice> => {
  const response = await api.post('/payments/invoices/', data);
  return response.data;
};

export const updateInvoice = async (id: number, data: Partial<Invoice>): Promise<Invoice> => {
  const response = await api.put(`/payments/invoices/${id}/`, data);
  return response.data;
};

export const getTransactions = async (): Promise<Transaction[]> => {
  const response = await api.get('/payments/transactions/');
  return response.data;
};

export const getPaymentSummary = async (): Promise<PaymentSummary> => {
  const response = await api.get('/payments/summary/');
  return response.data;
};
