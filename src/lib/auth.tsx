// lib/auth.ts

import axios from 'axios';
import dotenv from "dotenv";
dotenv.config();

// Access environment variables
// const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const BASE_URL = 'http://localhost:5001/admin-api'; // Replace with your API URL

interface LoginResponse {
  token: string;
  message?: string;
}

export const login = async (username: string, password: string): Promise<LoginResponse> => {
  try {
    const response = await axios.post<LoginResponse>(`${BASE_URL}/login`, { username, password });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to login');
  }
};
