import { Request, Response } from 'express';
import * as submissionService from '../services/submissionService';
import { AuthRequest } from '../middleware/auth';

// 提交代码
export async function createSubmission(req: AuthRequest, res: Response) {
  const userId = req.user!.id;
  const { problemId, language, sourceCode, contestId } = req.body;

  const submission = await submissionService.createSubmission({
    userId,
    problemId,
    language,
    sourceCode,
    contestId,
  });

  res.status(201).json({
    success: true,
    data: submission,
  });
}

// 获取提交历史
export async function getSubmissions(req: AuthRequest, res: Response) {
  const userId = req.user?.id;
  const { page, limit, problemId, status, language } = req.query;

  const result = await submissionService.getSubmissions({
    userId: userId as string,
    problemId: problemId as string,
    status: status as string,
    language: language as string,
    page: parseInt(page as string) || 1,
    limit: parseInt(limit as string) || 20,
  });

  res.json({
    success: true,
    data: result,
  });
}

// 获取提交详情
export async function getSubmissionById(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const userId = req.user?.id;
  const submission = await submissionService.getSubmissionById(id, userId);
  res.json({
    success: true,
    data: submission,
  });
}

// 获取评测状态
export async function getSubmissionStatus(req: Request, res: Response) {
  const { id } = req.params;
  const status = await submissionService.getSubmissionStatus(id);
  res.json({
    success: true,
    data: status,
  });
}

// 运行示例测试
export async function runSample(req: AuthRequest, res: Response) {
  const { problemId, language, sourceCode } = req.body;

  const result = await submissionService.runSample({
    problemId,
    language,
    sourceCode,
  });

  res.json({
    success: true,
    data: result,
  });
}
