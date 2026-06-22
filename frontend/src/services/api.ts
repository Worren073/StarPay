import axios, { AxiosError } from 'axios';
import { toast } from 'sonner';

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: Record<string, string[]>;
}

const getErrorMessage = (error: AxiosError): ApiError => {
  const defaultMessage = 'Error de conexión. Intenta de nuevo.';

  if (!error.response) {
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      return {
        message: 'No hay conexión con el servidor. Verifica tu conexión a internet.',
        code: 'NETWORK_ERROR',
      };
    }
    return {
      message: defaultMessage,
      code: 'UNKNOWN_ERROR',
    };
  }

  const { status, data } = error.response;
  let message = defaultMessage;
  let details: Record<string, string[]> | undefined;

  if (typeof data === 'object' && data !== null) {
    if ('detail' in data && typeof data.detail === 'string') {
      message = data.detail;
    } else if ('message' in data && typeof data.message === 'string') {
      message = data.message;
    } else if ('non_field_errors' in data && Array.isArray(data.non_field_errors)) {
      message = data.non_field_errors.join(', ');
    } else {
      const fieldErrors: Record<string, string[]> = {};
      let firstError = '';
      for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
        if (Array.isArray(value)) {
          fieldErrors[key] = value.map(String);
          if (!firstError) firstError = value[0];
        } else if (typeof value === 'string') {
          fieldErrors[key] = [value];
          if (!firstError) firstError = value;
        }
      }
      if (firstError) message = firstError;
      if (Object.keys(fieldErrors).length > 0) details = fieldErrors;
    }
  }

  switch (status) {
    case 400:
      message = message || 'Solicitud inválida. Verifica los datos ingresados.';
      break;
    case 401:
      message = message || 'No autorizado. Tu sesión puede haber expirado.';
      break;
    case 403:
      message = message || 'No tienes permiso para realizar esta acción.';
      break;
    case 404:
      message = message || 'El recurso solicitado no existe.';
      break;
    case 408:
      message = 'Tiempo de espera agotado. Intenta de nuevo.';
      break;
    case 409:
      message = message || 'Conflicto de datos. El registro ya existe.';
      break;
    case 422:
      message = message || 'Error de validación. Verifica los datos.';
      break;
    case 500:
      message = 'Error interno del servidor. Intenta más tarde.';
      break;
    case 502:
    case 503:
    case 504:
      message = 'El servidor no está disponible. Intenta más tarde.';
      break;
  }

  return { message, status, code: `HTTP_${status}`, details };
};

export const handleApiError = (error: unknown): ApiError => {
  if (axios.isAxiosError(error)) {
    return getErrorMessage(error);
  }
  return { message: 'Error inesperado. Intenta de nuevo.', code: 'UNKNOWN_ERROR' };
};

export const showErrorToast = (error: unknown, customMessage?: string) => {
  const apiError = handleApiError(error);
  toast.error(customMessage || apiError.message);
  return apiError;
};

const API_URL = import.meta.env.VITE_API_URL || `${window.location.origin}/api`;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as typeof error.config & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          if (originalRequest.headers && typeof originalRequest.headers === 'object') {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return api(originalRequest);
        }).catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');

        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const response = await axios.post(`${API_URL}/auth/token/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = response.data;
        localStorage.setItem('access_token', access);

        processQueue(null, access);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access}`;
        }

        return api(originalRequest);
      } catch {
        processQueue(new Error('Token refresh failed'));

        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');

        const currentPath = window.location.pathname;
        if (currentPath !== '/login') {
          window.location.href = '/login';
        }

        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
