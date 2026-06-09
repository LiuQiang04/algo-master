import request from '@/utils/request';
import type { ApiResponse, PaginatedData, PaginationParams, Contest, ContestStanding } from '@/types';

// Mock数据
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
  {
    id: 3,
    title: '新手挑战赛 #15',
    description: '面向初学者的算法竞赛',
    startTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 1.5 * 60 * 60 * 1000).toISOString(),
    status: 'running',
    type: 'unrated',
    problemCount: 3,
    participantCount: 156,
  },
  {
    id: 4,
    title: '春季杯 #8',
    description: '春季算法竞赛',
    startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
    status: 'ended',
    type: 'rated',
    problemCount: 5,
    participantCount: 423,
  },
];

const mockStandings: ContestStanding[] = [
  { rank: 1, userId: 101, username: 'AlgorithmMaster', score: 400, penalty: 125, problems: [{ label: 'A', status: 'solved', attempts: 1, time: 15 }, { label: 'B', status: 'solved', attempts: 2, time: 35 }, { label: 'C', status: 'solved', attempts: 1, time: 25 }, { label: 'D', status: 'solved', attempts: 1, time: 50 }] },
  { rank: 2, userId: 102, username: 'CodeNinja', score: 350, penalty: 98, problems: [{ label: 'A', status: 'solved', attempts: 1, time: 10 }, { label: 'B', status: 'solved', attempts: 1, time: 28 }, { label: 'C', status: 'solved', attempts: 3, time: 60 }, { label: 'D', status: 'none', attempts: 0 }] },
  { rank: 3, userId: 103, username: 'ByteExplorer', score: 300, penalty: 145, problems: [{ label: 'A', status: 'solved', attempts: 2, time: 20 }, { label: 'B', status: 'solved', attempts: 1, time: 45 }, { label: 'C', status: 'solved', attempts: 2, time: 80 }, { label: 'D', status: 'none', attempts: 0 }] },
  { rank: 4, userId: 104, username: 'DataWizard', score: 250, penalty: 67, problems: [{ label: 'A', status: 'solved', attempts: 1, time: 12 }, { label: 'B', status: 'solved', attempts: 1, time: 55 }, { label: 'C', status: 'none', attempts: 0 }, { label: 'D', status: 'none', attempts: 0 }] },
  { rank: 5, userId: 105, username: 'PixelCoder', score: 200, penalty: 112, problems: [{ label: 'A', status: 'solved', attempts: 1, time: 8 }, { label: 'B', status: 'attempted', attempts: 3 }, { label: 'C', status: 'solved', attempts: 2, time: 104 }, { label: 'D', status: 'none', attempts: 0 }] },
  { rank: 6, userId: 106, username: 'StackOverflow', score: 150, penalty: 45, problems: [{ label: 'A', status: 'solved', attempts: 1, time: 18 }, { label: 'B', status: 'attempted', attempts: 2 }, { label: 'C', status: 'none', attempts: 0 }, { label: 'D', status: 'none', attempts: 0 }] },
  { rank: 7, userId: 107, username: 'RecursiveThinker', score: 100, penalty: 78, problems: [{ label: 'A', status: 'solved', attempts: 3, time: 78 }, { label: 'B', status: 'none', attempts: 0 }, { label: 'C', status: 'none', attempts: 0 }, { label: 'D', status: 'none', attempts: 0 }] },
  { rank: 8, userId: 108, username: 'BinarySearcher', score: 50, penalty: 134, problems: [{ label: 'A', status: 'attempted', attempts: 4 }, { label: 'B', status: 'none', attempts: 0 }, { label: 'C', status: 'none', attempts: 0 }, { label: 'D', status: 'none', attempts: 0 }] },
];

const useMock = import.meta.env.VITE_USE_MOCK === 'true';

export async function getContests(
  params?: PaginationParams & { status?: string }
): Promise<PaginatedData<Contest>> {
  if (useMock) {
    let filtered = [...mockContests];
    if (params?.status && params.status !== 'all') {
      filtered = filtered.filter(c => c.status === params.status);
    }
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 10;
    const start = (page - 1) * pageSize;
    return {
      items: filtered.slice(start, start + pageSize),
      total: filtered.length,
      page,
      pageSize,
      totalPages: Math.ceil(filtered.length / pageSize),
    };
  }
  const res = await request.get<ApiResponse<PaginatedData<Contest>>>('/contests', { params });
  return res.data.data;
}

export async function getContestById(id: number): Promise<Contest> {
  if (useMock) {
    const contest = mockContests.find(c => c.id === id);
    if (contest) return contest;
    throw new Error('Contest not found');
  }
  const res = await request.get<ApiResponse<Contest>>(`/contests/${id}`);
  return res.data.data;
}

export async function joinContest(id: number): Promise<void> {
  if (useMock) {
    return;
  }
  await request.post<ApiResponse<null>>(`/contests/${id}/join`);
}

export async function getContestStandings(id: number): Promise<ContestStanding[]> {
  if (useMock) {
    return mockStandings;
  }
  const res = await request.get<ApiResponse<ContestStanding[]>>(`/contests/${id}/standings`);
  return res.data.data;
}
