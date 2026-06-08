import request from '@/utils/request';
import type { ApiResponse } from '@/types';

export interface UserProfileData {
  id: string;
  username: string;
  avatarUrl: string | null;
  bio: string | null;
  rating: number;
  level: number;
  createdAt: string;
  isFollowing?: boolean;
  _count: {
    posts: number;
    comments: number;
    followers: number;
    following: number;
  };
}

export interface UpdateProfileData {
  username?: string;
  bio?: string;
  avatarUrl?: string;
}

export async function getUserProfile(id: string): Promise<UserProfileData> {
  const res = await request.get<ApiResponse<UserProfileData>>(`/users/${id}`);
  return res.data.data;
}

export async function updateProfile(data: UpdateProfileData): Promise<UserProfileData> {
  const res = await request.put<ApiResponse<UserProfileData>>('/users/me/profile', data);
  return res.data.data;
}

export async function getUserPosts(
  id: string,
  params?: { page?: number; limit?: number }
) {
  const res = await request.get<ApiResponse<unknown>>(`/users/${id}/posts`, { params });
  return res.data.data;
}
