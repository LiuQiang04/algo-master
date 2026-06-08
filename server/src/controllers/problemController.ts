import { Request, Response } from 'express';
import * as problemService from '../services/problemService';
import { AuthRequest } from '../middleware/auth';

// 获取题目列表
export async function getProblems(req: Request, res: Response) {
  const { page, limit, difficulty, tag, search } = req.query;
  const result = await problemService.getProblems({
    page: parseInt(page as string) || 1,
    limit: parseInt(limit as string) || 20,
    difficulty: difficulty ? parseInt(difficulty as string) : undefined,
    tag: tag as string,
    search: search as string,
  });
  res.json({
    success: true,
    data: result,
  });
}

// 获取题目详情
export async function getProblemById(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const userId = req.user?.id;
  const problem = await problemService.getProblemById(id, userId);
  res.json({
    success: true,
    data: problem,
  });
}

// 创建题目（管理员）
export async function createProblem(req: AuthRequest, res: Response) {
  const userId = req.user!.id;
  const {
    title,
    description,
    inputFormat,
    outputFormat,
    sampleInput,
    sampleOutput,
    difficulty,
    timeLimit,
    memoryLimit,
    tags,
    testCases,
  } = req.body;

  const problem = await problemService.createProblem({
    title,
    description,
    inputFormat,
    outputFormat,
    sampleInput,
    sampleOutput,
    difficulty,
    timeLimit,
    memoryLimit,
    tags,
    testCases,
    authorId: userId,
  });

  res.status(201).json({
    success: true,
    data: problem,
  });
}

// 更新题目（管理员）
export async function updateProblem(req: Request, res: Response) {
  const { id } = req.params;
  const {
    title,
    description,
    inputFormat,
    outputFormat,
    sampleInput,
    sampleOutput,
    difficulty,
    timeLimit,
    memoryLimit,
    isPublic,
  } = req.body;

  const problem = await problemService.updateProblem(id, {
    title,
    description,
    inputFormat,
    outputFormat,
    sampleInput,
    sampleOutput,
    difficulty,
    timeLimit,
    memoryLimit,
    isPublic,
  });

  res.json({
    success: true,
    data: problem,
  });
}

// 删除题目（管理员）
export async function deleteProblem(req: Request, res: Response) {
  const { id } = req.params;
  const result = await problemService.deleteProblem(id);
  res.json({
    success: true,
    data: result,
  });
}

// 获取所有标签
export async function getTags(_req: Request, res: Response) {
  const tags = await problemService.getTags();
  res.json({
    success: true,
    data: tags,
  });
}

// 获取随机题目
export async function getRandomProblem(req: Request, res: Response) {
  const { difficulty } = req.query;
  const problem = await problemService.getRandomProblem(
    difficulty ? parseInt(difficulty as string) : undefined
  );
  res.json({
    success: true,
    data: problem,
  });
}
