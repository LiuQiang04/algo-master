import request from '@/utils/request';
import type { ApiResponse, PaginatedData, PaginationParams, Problem, ProblemListItem } from '@/types';


export async function getProblems(
  params?: PaginationParams & { difficulty?: string; tag?: string; keyword?: string; status?: string }
): Promise<PaginatedData<ProblemListItem>> {
  // Map frontend params to server-expected params
  const serverParams: Record<string, any> = { ...params };
  if (serverParams.keyword) {
    serverParams.search = serverParams.keyword;
    delete serverParams.keyword;
  }
  if (serverParams.difficulty) {
    // 'easy'→1, 'medium'→3, 'hard'→5
    const diffMap: Record<string, number> = { easy: 1, medium: 3, hard: 5 };
    serverParams.difficulty = diffMap[serverParams.difficulty as string] || undefined;
  }
  delete serverParams.status; // Server doesn't support status filter
  delete serverParams.pageSize; // Will be passed as limit below

  const res = await request.get<ApiResponse<any>>('/problems', {
    params: {
      ...serverParams,
      limit: params?.pageSize,
    },
  });
  const apiData = res.data.data;
  const problems = (apiData.problems || []).map((p: any) => ({
    ...p,
    solvedCount: p.solveCount ?? 0,
    submissionCount: p.submitCount ?? 0,
    tags: (p.tags || []).map((t: any) => t.name || t),
  }));
  return {
    items: problems,
    total: apiData.total || 0,
    page: apiData.page || 1,
    pageSize: apiData.pageSize || params?.pageSize || apiData.limit || 20,
    totalPages: apiData.totalPages || 0,
  };
}

export async function getProblemById(id: number): Promise<Problem> {
  const res = await request.get<ApiResponse<any>>(`/problems/${id}`);
  const raw = res.data.data;
  return {
    ...raw,
    tags: (raw.tags || []).map((t: any) => t.name || t),
    solvedCount: raw.solveCount ?? 0,
    submissionCount: raw.submitCount ?? 0,
  };
}

export async function getProblemTags(): Promise<string[]> {
  const res = await request.get<ApiResponse<any[]>>('/problems/tags');
  // Server returns [{id, name, category, problemCount}], UI expects string[]
  return (res.data.data || []).map((t: any) => t.name);
}
