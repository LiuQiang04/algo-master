import { Request, Response } from 'express';
import * as contestService from '../services/contestService';
import { AuthRequest } from '../middleware/auth';

// 获取竞赛列表
export async function getContests(req: Request, res: Response) {
  const { page, limit, status } = req.query;
  const result = await contestService.getContests({
    page: parseInt(page as string) || 1,
    limit: parseInt(limit as string) || 20,
    status: status as 'upcoming' | 'ongoing' | 'ended',
  });
  res.json({
    success: true,
    data: result,
  });
}

// 获取竞赛详情
export async function getContestById(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const userId = req.user?.id;
  const contest = await contestService.getContestById(id, userId);
  res.json({
    success: true,
    data: contest,
  });
}

// 创建竞赛
export async function createContest(req: AuthRequest, res: Response) {
  const userId = req.user!.id;
  const {
    title,
    description,
    startTime,
    endTime,
    isPublic,
    maxParticipants,
    problemIds,
  } = req.body;

  const contest = await contestService.createContest({
    title,
    description,
    startTime: new Date(startTime),
    endTime: new Date(endTime),
    isPublic,
    maxParticipants,
    creatorId: userId,
    problemIds,
  });

  res.status(201).json({
    success: true,
    data: contest,
  });
}

// 加入竞赛
export async function joinContest(req: AuthRequest, res: Response) {
  const userId = req.user!.id;
  const { id } = req.params;
  const participant = await contestService.joinContest(id, userId);
  res.json({
    success: true,
    data: participant,
  });
}

// 获取竞赛排名
export async function getContestRanking(req: Request, res: Response) {
  const { id } = req.params;
  const ranking = await contestService.getContestRanking(id);
  res.json({
    success: true,
    data: ranking,
  });
}

// 获取竞赛题目
export async function getContestProblems(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const userId = req.user?.id;
  const problems = await contestService.getContestProblems(id, userId);
  res.json({
    success: true,
    data: problems,
  });
}
