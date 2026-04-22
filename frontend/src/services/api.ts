import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { v4 as uuidv4 } from 'uuid';

export const api = axios.create({
  baseURL: '/expenses',
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach a fresh idempotency key to every POST request
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (config.method?.toUpperCase() === 'POST') {
    // Key is set per-mutation call (see useExpenses.ts), but fall back here
    if (!config.headers['Idempotency-Key']) {
      config.headers['Idempotency-Key'] = uuidv4();
    }
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err: AxiosError<{ message?: string }>) => {
    const message =
      err.response?.data?.message ?? err.message ?? 'Network error';
    return Promise.reject(new Error(message));
  }
);
