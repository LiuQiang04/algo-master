import api from '../api/client';

// 学习路径列表项
export interface LearningPathSummary {
  id: string;
  title: string;
  description: string;
  coverUrl: string | null;
  difficulty: number;
  totalModules: number;
  totalProblems: number;
  completedModules: number;
  completedProblems: number;
  estimatedHours: number;
  isPublished: boolean;
  createdAt: string;
}

// 模块中的题目
export interface ModuleProblem {
  id: string;
  title: string;
  difficulty: number;
  solveCount: number;
  tags: string[];
  completed: boolean;
  isRequired: boolean;
  sortOrder: number;
}

// 学习模块
export interface LearningModule {
  id: string;
  title: string;
  description: string;
  sortOrder: number;
  status: 'not_started' | 'in_progress' | 'completed';
  progress: number;
  completedCount: number;
  totalCount: number;
  problems: ModuleProblem[];
  knowledgePoints: string[];
}

// 学习路径详情
export interface LearningPathDetail {
  id: string;
  title: string;
  description: string;
  coverUrl: string | null;
  difficulty: number;
  estimatedHours: number;
  totalProblems: number;
  completedProblems: number;
  completedModules: number;
  totalModules: number;
  progressPercent: number;
  objectives: string[];
  modules: LearningModule[];
  createdAt: string;
}

// 用户进度
export interface UserPathProgress {
  pathProgress: {
    status: string;
    progress: number;
    startedAt: string | null;
    completedAt: string | null;
  } | null;
  moduleProgresses: {
    moduleId: string;
    moduleName: string;
    status: string;
    progress: number;
    startedAt: string | null;
    completedAt: string | null;
  }[];
}

// 获取所有学习路径
export async function getLearningPaths(): Promise<LearningPathSummary[]> {
  const response = await api.get('/paths');
  return response.data;
}

// 获取学习路径详情
export async function getLearningPathDetail(id: string): Promise<LearningPathDetail> {
  const response = await api.get(`/paths/${id}`);
  return response.data;
}

// 获取用户在指定路径的进度
export async function getUserPathProgress(pathId: string): Promise<UserPathProgress> {
  const response = await api.get(`/paths/${pathId}/progress`);
  return response.data;
}

// 开始学习路径
export async function startLearningPath(pathId: string): Promise<UserPathProgress> {
  const response = await api.post(`/paths/${pathId}/start`);
  return response.data;
}
