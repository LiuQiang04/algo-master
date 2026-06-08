import request from '@/utils/request';
import type { ApiResponse, PaginatedData, PaginationParams, Problem, ProblemListItem } from '@/types';

export async function getProblems(
  params?: PaginationParams & { difficulty?: string; tag?: string; keyword?: string; status?: string }
): Promise<PaginatedData<ProblemListItem>> {
  const res = await request.get<ApiResponse<PaginatedData<ProblemListItem>>>('/problems', { params });
  return res.data.data;
}

export async function getProblemById(id: number): Promise<Problem> {
  const res = await request.get<ApiResponse<Problem>>(`/problems/${id}`);
  return res.data.data;
}

export async function getProblemTags(): Promise<string[]> {
  const res = await request.get<ApiResponse<string[]>>('/problems/tags');
  return res.data.data;
}
