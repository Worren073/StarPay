export interface User {
  id: number;
  email: string;
  username: string;
  role: string;
  phone: string;
  created_at: string;
  updated_at: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
  user: User;
}

export interface Athlete {
  id: number;
  name: string;
  age: number;
  level: 'elite' | 'pro' | 'beginner';
  category: string;
  status: 'active' | 'inactive';
  speed_score: number;
  technique_score: number;
  form_score: number;
  coach: number | null;
  coach_name: string;
  user: number | null;
  created_at: string;
  updated_at: string;
}

export interface StaffMember {
  id: number;
  name: string;
  specialty: 'speed' | 'power';
  status: 'in_facility' | 'off_duty';
  athletes_count: number;
  next_session_time: string | null;
  user: number | null;
  created_at: string;
}

export interface Competition {
  id: number;
  name: string;
  date: string;
  location: string;
  type: 'qualifier' | 'championship' | 'exhibition';
  status: 'upcoming' | 'ongoing' | 'completed';
  max_athletes: number;
  description: string;
  results_count: number;
  created_at: string;
}

export interface CompetitionDetail extends Competition {
  results: Result[];
}

export interface Result {
  id: number;
  competition: number;
  athlete: number;
  athlete_name: string;
  score: string;
  position: number;
  category: string;
}

export interface Invoice {
  id: number;
  athlete: number;
  athlete_name: string;
  amount: string;
  status: 'paid' | 'pending' | 'overdue';
  due_date: string;
  description: string;
  created_at: string;
}

export interface Transaction {
  id: number;
  invoice: number;
  invoice_number: number;
  reference: string;
  amount: string;
  method: string;
  status: 'paid' | 'pending' | 'overdue';
  processed_at: string;
}

export interface PaymentSummary {
  total_collected: number;
  outstanding: number;
  pending_invoices_count: number;
  overdue_amount: number;
  next_billing_date: string | null;
  next_billing_estimated: number;
}
