import request from '@/utils/request';
import type { ApiResponse, ProblemListItem, Contest } from '@/types';

/** 获取热门题目（用于首页展示） */
export async function getPopularProblems(limit = 4): Promise<ProblemListItem[]> {
  const res = await request.get<ApiResponse<any>>('/problems', {
    params: { limit, page: 1 },
  });
  const apiData = res.data.data;
  return (apiData.problems || []).map((p: any) => ({
    ...p,
    solvedCount: p.solveCount ?? 0,
    submissionCount: p.submitCount ?? 0,
    tags: (p.tags || []).map((t: any) => t.name || t),
  }));
}

/** 获取即将开始的竞赛（用于首页展示） */
export async function getUpcomingContests(limit = 2): Promise<Contest[]> {
  const res = await request.get<ApiResponse<any>>('/contests', {
    params: { status: 'upcoming', limit, page: 1 },
  });
  const apiData = res.data.data;
  return (apiData.contests || []).map((c: any) => ({
    ...c,
    status: c.status === 'ongoing' ? 'running' : c.status,
    type: c.type || 'rated',
  }));
}
