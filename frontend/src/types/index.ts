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
  coaches: number[];
  coach_names: string[];
  user: number | null;
  plan_status: 'active' | 'expiring' | 'expired' | null;
  days_remaining: number | null;
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
  invoice_type: 'plan_renewal' | 'other';
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

export interface AthleteProgress {
  id: number;
  athlete: number;
  speed_score: number;
  technique_score: number;
  form_score: number;
  recorded_at: string;
}

export interface CompetitionAthlete {
  id: number;
  competition: number;
  athlete: number;
  athlete_name: string;
  status: 'invited' | 'confirmed' | 'participated';
}

export interface CompetitionCoach {
  id: number;
  competition: number;
  staff_member: number;
  staff_name: string;
}

export interface Plan {
  id: number;
  name: string;
  duration_days: number;
  price: string;
  created_at: string;
}

export interface AthletePlan {
  id: number;
  athlete: number;
  plan: number | null;
  plan_name: string;
  plan_price: string;
  start_date: string;
  end_date: string;
  auto_renew: boolean;
  days_remaining: number;
  duration_days: number;
  progress_percentage: number;
  status: 'active' | 'expiring' | 'expired';
  created_at: string;
}

export interface PaymentProof {
  id: number;
  invoice: number;
  invoice_number: number;
  method: 'pago_movil' | 'transferencia';
  phone: string;
  id_type: 'V' | 'E' | 'J';
  id_number: string;
  amount_ves: string;
  reference: string;
  bank_origin: string;
  image: string;
  status: 'paid' | 'pending' | 'overdue';
  submitted_at: string;
}

export interface Notification {
  id: number;
  recipient: number;
  notification_type: string;
  title: string;
  message: string;
  link: string;
  is_read: boolean;
  created_at: string;
}

export interface AthleteProfile {
  id: number;
  name: string;
  age: number;
  level: string;
  category: string;
  status: string;
  speed_score: number;
  technique_score: number;
  form_score: number;
  coaches: number[];
  coach_names: string[];
  coach_specialties: string[];
}
