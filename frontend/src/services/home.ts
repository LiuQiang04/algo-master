import request from '@/utils/request';
import type { ApiResponse, PaginatedData, ProblemListItem, Contest } from '@/types';

/** 获取热门题目（用于首页展示） */
export async function getPopularProblems(limit = 4): Promise<ProblemListItem[]> {
  const res = await request.get<ApiResponse<PaginatedData<ProblemListItem>>>('/problems', {
    params: { limit, sort: 'popular', page: 1, pageSize: limit },
  });
  return res.data.data.items;
}

/** 获取即将开始的竞赛（用于首页展示） */
export async function getUpcomingContests(limit = 2): Promise<Contest[]> {
  const res = await request.get<ApiResponse<PaginatedData<Contest>>>('/contests', {
    params: { status: 'upcoming', limit, page: 1, pageSize: limit },
  });
  return res.data.data.items;
}
