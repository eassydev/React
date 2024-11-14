// lib/auth.ts

import axios from 'axios';

const API_URL = 'http://localhost:5001/admin'; // Replace with your API URL

interface LoginResponse {
  token: string;
  message?: string;
}

export const login = async (username: string, password: string): Promise<LoginResponse> => {
  try {
    const response = await axios.post<LoginResponse>(`${API_URL}/login`, { username, password });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to login');
  }
};
