import apiClient from './client';
import { storageUtils, STORAGE_KEYS } from '../utils/storage';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  email: string;
  message?: string;
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  roles?: string[];
}

export interface ApiError {
  error: string;
  message?: string;
}

// Login user
export const login = async (credentials: LoginRequest): Promise<AuthResponse> => {
  try {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    const { token } = response.data;
    
    // Store token
    if (token) {
      storageUtils.set(STORAGE_KEYS.TOKEN, token);
    }
    
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.error || 'Login failed. Please try again.';
    throw new Error(errorMessage);
  }
};

// Register new user
export const register = async (userData: RegisterRequest): Promise<AuthResponse> => {
  try {
    const response = await apiClient.post<AuthResponse>('/auth/register', userData);
    const { token } = response.data;
    
    // Store token
    if (token) {
      storageUtils.set(STORAGE_KEYS.TOKEN, token);
    }
    
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.error || 'Registration failed. Please try again.';
    throw new Error(errorMessage);
  }
};

// Get current user
export const getCurrentUser = async (): Promise<User> => {
  try {
    const response = await apiClient.get<User>('/auth/me');
    const user = response.data;
    
    // Store user data
    storageUtils.set(STORAGE_KEYS.USER, user);
    
    return user;
  } catch (error: any) {
    const errorMessage = error.response?.data?.error || 'Failed to fetch user data';
    throw new Error(errorMessage);
  }
};

// Logout user
export const logout = (): void => {
  storageUtils.remove(STORAGE_KEYS.TOKEN);
  storageUtils.remove(STORAGE_KEYS.USER);
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  const token = storageUtils.get<string>(STORAGE_KEYS.TOKEN);
  return !!token;
};

// Get stored token
export const getToken = (): string | null => {
  return storageUtils.get<string>(STORAGE_KEYS.TOKEN);
};

// Get stored user
export const getStoredUser = (): User | null => {
  return storageUtils.get<User>(STORAGE_KEYS.USER);
};

