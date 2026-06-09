import request from '@/utils/request';
import type { ApiResponse, PaginatedData, ProblemListItem, Contest } from '@/types';

// Mock数据
const mockProblems: ProblemListItem[] = [
  { id: 1, title: '两数之和', slug: 'two-sum', difficulty: 'easy', tags: ['数组', '哈希表'], acceptanceRate: 52.3, submissionCount: 1234, solvedCount: 645 },
  { id: 2, title: '反转链表', slug: 'reverse-linked-list', difficulty: 'easy', tags: ['链表'], acceptanceRate: 71.2, submissionCount: 987, solvedCount: 703 },
  { id: 3, title: '二叉树的中序遍历', slug: 'binary-tree-inorder', difficulty: 'easy', tags: ['树', '栈'], acceptanceRate: 75.8, submissionCount: 856, solvedCount: 649 },
  { id: 4, title: '最大子序和', slug: 'maximum-subarray', difficulty: 'medium', tags: ['数组', '分治', '动态规划'], acceptanceRate: 50.1, submissionCount: 2345, solvedCount: 1175 },
];

const mockContests: Contest[] = [
  {
    id: 1,
    title: '周赛 #128',
    description: '每周算法竞赛，题目难度适中',
    startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
    status: 'upcoming',
    type: 'rated',
    problemCount: 4,
    participantCount: 234,
  },
  {
    id: 2,
    title: '双周赛 #45',
    description: '双周算法竞赛，题目难度较高',
    startTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 2.5 * 60 * 60 * 1000).toISOString(),
    status: 'upcoming',
    type: 'rated',
    problemCount: 4,
    participantCount: 156,
  },
];

const useMock = import.meta.env.VITE_USE_MOCK === 'true';

/** 获取热门题目（用于首页展示） */
export async function getPopularProblems(limit = 4): Promise<ProblemListItem[]> {
  if (useMock) {
    return mockProblems.slice(0, limit);
  }
  const res = await request.get<ApiResponse<PaginatedData<ProblemListItem>>>('/problems', {
    params: { limit, sort: 'popular', page: 1, pageSize: limit },
  });
  return res.data.data.items;
}

/** 获取即将开始的竞赛（用于首页展示） */
export async function getUpcomingContests(limit = 2): Promise<Contest[]> {
  if (useMock) {
    return mockContests.slice(0, limit);
  }
  const res = await request.get<ApiResponse<PaginatedData<Contest>>>('/contests', {
    params: { status: 'upcoming', limit, page: 1, pageSize: limit },
  });
  return res.data.data.items;
}
