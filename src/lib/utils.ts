import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Cookie utility functions
export const cookieUtils = {
  set: (name: string, value: string, days: number = 7) => {
    const maxAge = days * 24 * 60 * 60; // Convert days to seconds
    document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`;
  },

  get: (name: string): string | null => {
    const value = document.cookie
      .split('; ')
      .find((row) => row.startsWith(`${name}=`))
      ?.split('=')[1];
    return value || null;
  },

  remove: (name: string) => {
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  },
};

// Token management utilities
export const tokenUtils = {
  set: (token: string) => {
    localStorage.setItem('token', token);
    cookieUtils.set('token', token, 7);
  },

  get: (): string | null => {
    return localStorage.getItem('token') || cookieUtils.get('token');
  },

  remove: () => {
    localStorage.removeItem('token');
    cookieUtils.remove('token');
  },
};

// Admin token management utilities
export const adminTokenUtils = {
  set: (token: string) => {
    localStorage.setItem('adminToken', token);
    cookieUtils.set('adminToken', token, 7);
  },

  get: (): string | null => {
    return localStorage.getItem('adminToken') || cookieUtils.get('adminToken');
  },

  remove: () => {
    localStorage.removeItem('adminToken');
    cookieUtils.remove('adminToken');
  },
};
