import request from '@/utils/request';
import type { ApiResponse, PaginatedData, PaginationParams, Submission, SubmissionResult, RunSampleResponse } from '@/types';

export async function submitCode(
  problemId: number,
  data: { language: string; code: string }
): Promise<SubmissionResult> {
  const res = await request.post<ApiResponse<SubmissionResult>>(
    '/submissions',
    { ...data, problemId }
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

export async function runSample(
  problemId: number,
  data: { language: string; code: string }
): Promise<RunSampleResponse> {
  const res = await request.post<ApiResponse<RunSampleResponse>>(
    '/submissions/run-sample',
    { problemId, language: data.language, sourceCode: data.code }
  );
  return res.data.data;
}

export async function getSubmissionStatus(id: number): Promise<{
  id: number;
  status: SubmissionStatus;
  executionTime?: number;
  memoryUsed?: number;
  score: number;
}> {
  const res = await request.get<ApiResponse<any>>(`/submissions/${id}/status`);
  return res.data.data;
}
