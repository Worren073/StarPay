import api from './api';
import type { Invoice, Transaction, PaymentSummary, PaymentProof } from '../types';

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

export const getInvoiceProofs = async (invoiceId: number): Promise<PaymentProof[]> => {
  const response = await api.get(`/payments/invoices/${invoiceId}/proofs/`);
  return response.data;
};

export const submitPayment = async (invoiceId: number, data: FormData): Promise<PaymentProof> => {
  const response = await api.post(`/payments/invoices/${invoiceId}/submit_payment/`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const submitCashPayment = async (invoiceId: number, data: {
  method: string;
  phone: string;
  id_type: string;
  id_number: string;
  amount_ves: string;
  reference: string;
  bank_origin: string;
}): Promise<PaymentProof> => {
  const response = await api.post(`/payments/invoices/${invoiceId}/submit_payment/`, data);
  return response.data;
};

export const verifyProof = async (invoiceId: number, proofId: number, status: string): Promise<PaymentProof> => {
  const response = await api.patch(`/payments/invoices/${invoiceId}/verify_proof/`, { proof_id: proofId, status });
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

export const deleteInvoice = async (id: number): Promise<void> => {
  await api.delete(`/payments/invoices/${id}/`);
};
