interface RateData {
  rate: number;
  updatedAt: string;
}

const API_URL = 'https://ve.dolarapi.com/v1/dolares/oficial';
const STORAGE_KEY = 'ves_exchange_rate';
const CACHE_TTL_MS = 30 * 60 * 1000;

export function getCachedRate(): RateData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data: RateData = JSON.parse(raw);
    const age = Date.now() - new Date(data.updatedAt).getTime();
    if (age > CACHE_TTL_MS) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function setCachedRate(rate: number): void {
  const data: RateData = { rate, updatedAt: new Date().toISOString() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export async function fetchVesRate(): Promise<number> {
  const cached = getCachedRate();
  if (cached) return cached.rate;

  const response = await fetch(API_URL);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json();
  const rate = parseFloat(data.promedio || data.price);
  if (!rate || rate <= 0) throw new Error('Invalid rate');

  setCachedRate(rate);
  return rate;
}

export function formatUSD(amount: string | number): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatVES(amount: string | number, rate: number): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  const ves = num * rate;
  return `${ves.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs`;
}

export function formatBoth(amount: string | number, rate: number | null): string {
  const usd = formatUSD(amount);
  if (rate === null || rate <= 0) return usd;
  return `${usd} (${formatVES(amount, rate)})`;
}