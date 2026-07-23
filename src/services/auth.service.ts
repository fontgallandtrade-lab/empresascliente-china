import { api } from '../api/client';

export type UserRole = 'customer' | 'company' | 'driver';

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  status: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role: UserRole;
}

export async function login(
  payload: LoginPayload
): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>(
    '/auth/login',
    payload
  );

  return response.data;
}

export async function register(
  payload: RegisterPayload
): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>(
    '/auth/register',
    payload
  );

  return response.data;
}

export async function getAuthenticatedUser(
  token: string
): Promise<{ success: boolean; user: User }> {
  const response = await api.get<{
    success: boolean;
    user: User;
  }>('/auth/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}
