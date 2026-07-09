import request from '@/utils/request';
import type { ApiResponse, PaginatedData, PaginationParams, Problem, ProblemListItem } from '@/types';

// Mock数据
const mockProblems: ProblemListItem[] = [
  { id: 1, title: '两数之和', slug: 'two-sum', difficulty: 'easy', tags: ['数组', '哈希表'], acceptanceRate: 52.3, submissionCount: 1234, solvedCount: 645 },
  { id: 2, title: '反转链表', slug: 'reverse-linked-list', difficulty: 'easy', tags: ['链表'], acceptanceRate: 71.2, submissionCount: 987, solvedCount: 703 },
  { id: 3, title: '二叉树的中序遍历', slug: 'binary-tree-inorder', difficulty: 'easy', tags: ['树', '栈'], acceptanceRate: 75.8, submissionCount: 856, solvedCount: 649 },
  { id: 4, title: '最大子序和', slug: 'maximum-subarray', difficulty: 'medium', tags: ['数组', '分治', '动态规划'], acceptanceRate: 50.1, submissionCount: 2345, solvedCount: 1175 },
  { id: 5, title: '合并两个有序链表', slug: 'merge-two-lists', difficulty: 'easy', tags: ['链表', '递归'], acceptanceRate: 65.4, submissionCount: 1567, solvedCount: 1025 },
  { id: 6, title: '有效的括号', slug: 'valid-parentheses', difficulty: 'easy', tags: ['栈', '字符串'], acceptanceRate: 43.2, submissionCount: 2890, solvedCount: 1249 },
  { id: 7, title: '爬楼梯', slug: 'climbing-stairs', difficulty: 'easy', tags: ['动态规划'], acceptanceRate: 51.8, submissionCount: 1876, solvedCount: 972 },
  { id: 8, title: '二分查找', slug: 'binary-search', difficulty: 'easy', tags: ['数组', '二分查找'], acceptanceRate: 54.1, submissionCount: 1432, solvedCount: 775 },
  { id: 9, title: '无重复字符的最长子串', slug: 'longest-substring', difficulty: 'medium', tags: ['哈希表', '字符串', '滑动窗口'], acceptanceRate: 35.7, submissionCount: 3456, solvedCount: 1234 },
  { id: 10, title: '最长回文子串', slug: 'longest-palindrome', difficulty: 'medium', tags: ['字符串', '动态规划'], acceptanceRate: 32.4, submissionCount: 2987, solvedCount: 968 },
  { id: 11, title: '盛最多水的容器', slug: 'container-with-water', difficulty: 'medium', tags: ['数组', '双指针', '贪心'], acceptanceRate: 54.8, submissionCount: 2134, solvedCount: 1170 },
  { id: 12, title: '三数之和', slug: 'three-sum', difficulty: 'medium', tags: ['数组', '双指针', '排序'], acceptanceRate: 27.9, submissionCount: 4567, solvedCount: 1274 },
  { id: 13, title: '电话号码的字母组合', slug: 'letter-combinations', difficulty: 'medium', tags: ['字符串', '回溯'], acceptanceRate: 55.1, submissionCount: 1678, solvedCount: 925 },
  { id: 14, title: '删除链表的倒数第N个节点', slug: 'remove-nth-node', difficulty: 'medium', tags: ['链表', '双指针'], acceptanceRate: 40.3, submissionCount: 2345, solvedCount: 945 },
  { id: 15, title: '有效的数独', slug: 'valid-sudoku', difficulty: 'medium', tags: ['数组', '哈希表', '矩阵'], acceptanceRate: 55.9, submissionCount: 1234, solvedCount: 690 },
  { id: 16, title: '只出现一次的数字', slug: 'single-number', difficulty: 'easy', tags: ['位运算', '数组'], acceptanceRate: 70.2, submissionCount: 987, solvedCount: 693 },
  { id: 17, title: '环形链表', slug: 'linked-list-cycle', difficulty: 'easy', tags: ['链表', '双指针'], acceptanceRate: 47.6, submissionCount: 1567, solvedCount: 746 },
  { id: 18, title: '相交链表', slug: 'intersection-two-lists', difficulty: 'easy', tags: ['链表', '双指针'], acceptanceRate: 58.3, submissionCount: 1234, solvedCount: 719 },
  { id: 19, title: '多数元素', slug: 'majority-element', difficulty: 'easy', tags: ['数组', '哈希表', '分治'], acceptanceRate: 65.7, submissionCount: 1098, solvedCount: 721 },
  { id: 20, title: '搜索旋转排序数组', slug: 'search-rotated-array', difficulty: 'hard', tags: ['数组', '二分查找'], acceptanceRate: 39.2, submissionCount: 2345, solvedCount: 920 },
];

const mockTags = ['数组', '字符串', '哈希表', '动态规划', '数学', '排序', '贪心', '二分查找', '树', '图', '链表', '栈', '队列', '堆', '递归', 'BFS', 'DFS', '回溯', '滑动窗口', '双指针'];

const useMock = import.meta.env.VITE_USE_MOCK === 'true';

export async function getProblems(
  params?: PaginationParams & { difficulty?: string; tag?: string; keyword?: string; status?: string }
): Promise<PaginatedData<ProblemListItem>> {
  if (useMock) {
    let filtered = [...mockProblems];
    if (params?.difficulty && params.difficulty !== 'all') {
      filtered = filtered.filter(p => p.difficulty === params.difficulty);
    }
    if (params?.keyword) {
      filtered = filtered.filter(p => p.title.includes(params.keyword!));
    }
    if (params?.tag) {
      const tags = params.tag.split(',');
      filtered = filtered.filter(p => tags.some(t => p.tags.includes(t)));
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
  const res = await request.get<ApiResponse<any>>('/problems', {
    params: {
      ...params,
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
  if (useMock) {
    const problem = mockProblems.find(p => p.id === id);
    if (problem) {
      return {
        ...problem,
        description: `## ${problem.title}\n\n这是一个关于${problem.tags.join('、')}的题目。\n\n### 题目描述\n\n给定一个数组，找出其中满足条件的元素。\n\n### 示例\n\n**输入:** [1, 2, 3, 4, 5]\n**输出:** 5\n\n### 提示\n\n- 1 <= n <= 1000\n- 时间复杂度要求 O(n)`,
        inputFormat: '第一行一个整数 n，表示数组长度。\n第二行 n 个整数，表示数组元素。',
        outputFormat: '一行一个整数，表示答案。',
        sampleInput: '5\n1 2 3 4 5',
        sampleOutput: '5',
        timeLimit: 1000,
        memoryLimit: 256,
        createdAt: new Date().toISOString(),
      };
    }
    throw new Error('Problem not found');
  }
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
  if (useMock) {
    return mockTags;
  }
  const res = await request.get<ApiResponse<string[]>>('/problems/tags');
  return res.data.data;
}
