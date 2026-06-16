import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { fetchVesRate, getCachedRate, formatUSD, formatVES, formatBoth } from '../services/rateService';

interface ExchangeRateContextValue {
  rate: number | null;
  loading: boolean;
  error: string | null;
  formatUSD: (amount: string | number) => string;
  formatVES: (amount: string | number) => string;
  formatBoth: (amount: string | number) => string;
  refresh: () => Promise<void>;
}

const ExchangeRateContext = createContext<ExchangeRateContextValue | null>(null);

const REFRESH_INTERVAL = 30 * 60 * 1000;

export function ExchangeRateProvider({ children }: { children: ReactNode }) {
  const [rate, setRate] = useState<number | null>(() => {
    const cached = getCachedRate();
    return cached ? cached.rate : null;
  });
  const [loading, setLoading] = useState(!rate);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetchVesRate();
      setRate(r);
    } catch {
      const cached = getCachedRate();
      if (cached) {
        setRate(cached.rate);
      } else {
        setError('No se pudo obtener la tasa de cambio');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [refresh]);

  const value: ExchangeRateContextValue = {
    rate,
    loading,
    error,
    formatUSD: (amount) => formatUSD(amount),
    formatVES: (amount) => formatVES(amount, rate ?? 0),
    formatBoth: (amount) => formatBoth(amount, rate),
    refresh,
  };

  return (
    <ExchangeRateContext.Provider value={value}>
      {children}
    </ExchangeRateContext.Provider>
  );
}

export function useExchangeRate(): ExchangeRateContextValue {
  const ctx = useContext(ExchangeRateContext);
  if (!ctx) throw new Error('useExchangeRate must be used within ExchangeRateProvider');
  return ctx;
}