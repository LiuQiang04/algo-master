import { Request, Response } from 'express';
import * as postService from '../services/postService';
import { AuthRequest } from '../middleware/auth';

// 获取帖子列表
export async function getPosts(req: Request, res: Response) {
  const { page, limit, postType, problemId, userId, search } = req.query;
  const result = await postService.getPosts({
    page: parseInt(page as string) || 1,
    limit: parseInt(limit as string) || 20,
    postType: postType as string,
    problemId: problemId as string,
    userId: userId as string,
    search: search as string,
  });
  res.json({
    success: true,
    data: result,
  });
}

// 获取帖子详情
export async function getPostById(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const userId = req.user?.id;
  const post = await postService.getPostById(id, userId);
  res.json({
    success: true,
    data: post,
  });
}

// 创建帖子
export async function createPost(req: AuthRequest, res: Response) {
  const userId = req.user!.id;
  const { title, content, postType, problemId } = req.body;

  const post = await postService.createPost({
    userId,
    title,
    content,
    postType,
    problemId,
  });

  res.status(201).json({
    success: true,
    data: post,
  });
}

// 更新帖子
export async function updatePost(req: AuthRequest, res: Response) {
  const userId = req.user!.id;
  const { id } = req.params;
  const { title, content } = req.body;

  const post = await postService.updatePost(id, userId, { title, content });
  res.json({
    success: true,
    data: post,
  });
}

// 删除帖子
export async function deletePost(req: AuthRequest, res: Response) {
  const userId = req.user!.id;
  const { id } = req.params;
  const isAdmin = req.user!.role === 'ADMIN';

  const result = await postService.deletePost(id, userId, isAdmin);
  res.json({
    success: true,
    data: result,
  });
}

// 投票
export async function votePost(req: AuthRequest, res: Response) {
  const userId = req.user!.id;
  const { id } = req.params;
  const { value } = req.body;

  const result = await postService.votePost(id, userId, value);
  res.json({
    success: true,
    data: result,
  });
}

// 创建评论
export async function createComment(req: AuthRequest, res: Response) {
  const userId = req.user!.id;
  const { id } = req.params;
  const { content, parentCommentId } = req.body;

  const comment = await postService.createComment({
    userId,
    postId: id,
    content,
    parentCommentId,
  });

  res.status(201).json({
    success: true,
    data: comment,
  });
}

// 更新评论
export async function updateComment(req: AuthRequest, res: Response) {
  const userId = req.user!.id;
  const { id } = req.params;
  const { content } = req.body;

  const comment = await postService.updateComment(id, userId, content);
  res.json({
    success: true,
    data: comment,
  });
}

// 获取评论
export async function getComments(req: Request, res: Response) {
  const { id } = req.params;
  const { page, limit } = req.query;

  const result = await postService.getComments(
    id,
    parseInt(page as string) || 1,
    parseInt(limit as string) || 20
  );

  res.json({
    success: true,
    data: result,
  });
}
