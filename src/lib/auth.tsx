// lib/auth.ts

import axios from 'axios';
import dotenv from "dotenv";
dotenv.config();

// Access environment variables
const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// const BASE_URL = 'http://localhost:5001/api'; // Replace with your API URL

interface LoginResponse {
  status: boolean;
  token: string;
  message?: string;
  admin?: {
    id: string;
    username: string;
    email: string;
    role: string;
    permissions: string[];
  };
}

export const login = async (username: string, password: string): Promise<LoginResponse> => {
  try {
    console.log("Sending login request to:", `${BASE_URL}/login`);
    console.log("Request payload:", { username, password: "***" });

    const response = await axios.post(`${BASE_URL}/login`, {
      username,
      password
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000 // 10 second timeout
    });

    console.log("Login response status:", response.status);
    console.log("Login response data:", response.data);

    if (response.data.status === false) {
      throw new Error(response.data.message || 'Login failed');
    }

    return response.data;
  } catch (error: any) {
    console.error("Login error details:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });

    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else if (error.code === 'ECONNREFUSED') {
      throw new Error('Cannot connect to server. Please check if the backend is running.');
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. Please try again.');
    } else {
      throw new Error(error.message || 'Failed to login');
    }
  }
};

export const logout = async (): Promise<void> => {
  try {
    // Import tokenUtils here to avoid circular dependency
    const { tokenUtils } = await import('./utils');
    const token = tokenUtils.get();

    if (token) {
      // Call backend logout endpoint
      await axios.post(`${BASE_URL}/logout`, {}, {
        headers: {
          'admin-auth-token': token
        }
      });
    }
  } catch (error) {
    console.error("Logout error:", error);
    // Continue with local cleanup even if backend call fails
  } finally {
    // Always clear local storage and cookies
    const { tokenUtils } = await import('./utils');
    tokenUtils.remove();
  }
};
