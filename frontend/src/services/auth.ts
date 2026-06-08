import request from '@/utils/request';
import type { ApiResponse, AuthResponse, LoginRequest, RegisterRequest, User } from '@/types';

export async function login(data: LoginRequest): Promise<AuthResponse> {
  const res = await request.post<ApiResponse<AuthResponse>>('/auth/login', data);
  return res.data.data;
}

export async function register(data: RegisterRequest): Promise<AuthResponse> {
  const res = await request.post<ApiResponse<AuthResponse>>('/auth/register', data);
  return res.data.data;
}

export async function getProfile(): Promise<User> {
  const res = await request.get<ApiResponse<User>>('/auth/profile');
  return res.data.data;
}
