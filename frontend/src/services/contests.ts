import request from '@/utils/request';
import type { ApiResponse, PaginatedData, PaginationParams, Contest, ContestStanding } from '@/types';

export async function getContests(
  params?: PaginationParams & { status?: string }
): Promise<PaginatedData<Contest>> {
  const res = await request.get<ApiResponse<PaginatedData<Contest>>>('/contests', { params });
  return res.data.data;
}

export async function getContestById(id: number): Promise<Contest> {
  const res = await request.get<ApiResponse<Contest>>(`/contests/${id}`);
  return res.data.data;
}

export async function getContestStandings(id: number): Promise<ContestStanding[]> {
  const res = await request.get<ApiResponse<ContestStanding[]>>(`/contests/${id}/standings`);
  return res.data.data;
}
