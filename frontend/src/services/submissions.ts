import request from '@/utils/request';
import type { ApiResponse, PaginatedData, PaginationParams, Submission, SubmissionResult } from '@/types';

export async function submitCode(
  problemId: number,
  data: { language: string; code: string }
): Promise<SubmissionResult> {
  const res = await request.post<ApiResponse<SubmissionResult>>(
    `/problems/${problemId}/submissions`,
    data
  );
  return res.data.data;
}

export async function getSubmissions(
  params?: PaginationParams & { problemId?: number; status?: string }
): Promise<PaginatedData<Submission>> {
  const res = await request.get<ApiResponse<PaginatedData<Submission>>>('/submissions', { params });
  return res.data.data;
}

export async function getSubmissionDetail(id: number): Promise<Submission> {
  const res = await request.get<ApiResponse<Submission>>(`/submissions/${id}`);
  return res.data.data;
}
