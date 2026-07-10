import request from '@/utils/request';
import type { ApiResponse, PaginatedData, PaginationParams, Contest, ContestStanding } from '@/types';

export async function getContests(
  params?: PaginationParams & { status?: string }
): Promise<PaginatedData<Contest>> {
  const serverParams: Record<string, any> = { ...params };
  if (serverParams.status === 'running') {
    serverParams.status = 'ongoing';
  }

  const res = await request.get<ApiResponse<any>>('/contests', {
    params: { ...serverParams, limit: params?.pageSize },
  });
  const apiData = res.data.data;
  const items = (apiData.contests || []).map((c: any) => ({
    ...c,
    status: c.status === 'ongoing' ? 'running' : c.status,
    type: c.type,
  }));
  return {
    items,
    total: apiData.total || 0,
    page: apiData.page || 1,
    pageSize: params?.pageSize || 20,
    totalPages: apiData.totalPages || 0,
  };
}

export async function getContestById(id: number | string): Promise<Contest> {
  const res = await request.get<ApiResponse<any>>(`/contests/${id}`);
  const raw = res.data.data;
  // Map difficulty from number to string for contest problems
  if (raw.problems) {
    raw.problems = raw.problems.map((p: any) => ({
      ...p,
      problem: p.problem ? {
        ...p.problem,
        difficulty: ({ 1: 'easy', 2: 'easy', 3: 'medium', 4: 'hard', 5: 'hard' } as any)[p.problem.difficulty] || 'medium',
      } : undefined,
    }));
  }
  return {
    ...raw,
    status: raw.status === 'ongoing' ? 'running' : raw.status,
    type: raw.type || 'rated',
  };
}

export async function joinContest(id: number | string): Promise<void> {
  await request.post<ApiResponse<null>>(`/contests/${id}/join`);
}

export async function getContestStandings(id: number | string): Promise<ContestStanding[]> {
  const res = await request.get<ApiResponse<any[]>>(`/contests/${id}/standings`);
  return (res.data.data || []).map((entry: any) => ({
    rank: entry.rank,
    userId: entry.userId,
    username: entry.username,
    score: entry.totalScore || 0,
    penalty: entry.penalty || 0,
    problems: entry.problems || [],
  }));
}
