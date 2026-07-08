import { prisma } from '../utils/prisma';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errors';

// 获取帖子列表
export async function getPosts(params: {
  page?: number;
  limit?: number;
  postType?: string;
  problemId?: string;
  userId?: string;
  search?: string;
}) {
  const { page = 1, limit = 20, postType, problemId, userId, search } = params;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (postType) where.postType = postType;
  if (problemId) where.problemId = problemId;
  if (userId) where.userId = userId;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { content: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      select: {
        id: true,
        title: true,
        content: true,
        postType: true,
        upvotes: true,
        downvotes: true,
        createdAt: true,
        user: {
          select: { id: true, username: true, avatarUrl: true },
        },
        problem: {
          select: { id: true, title: true },
        },
        _count: {
          select: { comments: true },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.post.count({ where }),
  ]);

  return {
    posts: posts.map((p) => ({
      ...p,
      commentCount: p._count.comments,
      voteScore: p.upvotes - p.downvotes,
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

// 获取帖子详情
export async function getPostById(postId: string, userId?: string) {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      user: {
        select: { id: true, username: true, avatarUrl: true },
      },
      problem: {
        select: { id: true, title: true },
      },
      comments: {
        where: { parentCommentId: null },
        include: {
          user: {
            select: { id: true, username: true, avatarUrl: true },
          },
          replies: {
            include: {
              user: {
                select: { id: true, username: true, avatarUrl: true },
              },
            },
            orderBy: { createdAt: 'asc' },
          },
        },
        orderBy: { createdAt: 'asc' },
      },
      _count: {
        select: { comments: true },
      },
    },
  });

  if (!post) {
    throw new NotFoundError('帖子不存在');
  }

  // 如果用户已登录，获取其投票状态
  let userVote: number | null = null;
  if (userId) {
    const vote = await prisma.vote.findUnique({
      where: {
        userId_postId: { userId, postId },
      },
    });
    userVote = vote?.value || null;
  }

  return {
    ...post,
    commentCount: post._count.comments,
    voteScore: post.upvotes - post.downvotes,
    userVote,
  };
}

// 创建帖子
export async function createPost(data: {
  userId: string;
  title: string;
  content: string;
  postType: string;
  problemId?: string;
}) {
  const validTypes = ['discussion', 'solution', 'question', 'announcement'];
  if (!validTypes.includes(data.postType)) {
    throw new BadRequestError(`无效的帖子类型: ${data.postType}`);
  }

  const post = await prisma.post.create({
    data: {
      userId: data.userId,
      title: data.title,
      content: data.content,
      postType: data.postType,
      problemId: data.problemId,
    },
    include: {
      user: {
        select: { id: true, username: true, avatarUrl: true },
      },
    },
  });

  // 添加发帖积分
  const { addPoints, POINT_RULES } = await import('./gamification/points');
  await addPoints(data.userId, POINT_RULES.POST_CREATE, 'post', '发布帖子');

  return post;
}

// 更新帖子
export async function updatePost(
  postId: string,
  userId: string,
  data: { title?: string; content?: string }
) {
  const post = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!post) {
    throw new NotFoundError('帖子不存在');
  }

  if (post.userId !== userId) {
    throw new ForbiddenError('只能编辑自己的帖子');
  }

  return prisma.post.update({
    where: { id: postId },
    data,
    include: {
      user: {
        select: { id: true, username: true, avatarUrl: true },
      },
    },
  });
}

// 删除帖子
export async function deletePost(postId: string, userId: string, isAdmin: boolean) {
  const post = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!post) {
    throw new NotFoundError('帖子不存在');
  }

  if (post.userId !== userId && !isAdmin) {
    throw new ForbiddenError('只能删除自己的帖子');
  }

  await prisma.post.delete({ where: { id: postId } });
  return { message: '帖子已删除' };
}

// 投票
export async function votePost(postId: string, userId: string, value: 1 | -1) {
  const post = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!post) {
    throw new NotFoundError('帖子不存在');
  }

  // 检查是否已投票
  const existingVote = await prisma.vote.findUnique({
    where: {
      userId_postId: { userId, postId },
    },
  });

  if (existingVote) {
    if (existingVote.value === value) {
      // 取消投票
      await prisma.vote.delete({
        where: { id: existingVote.id },
      });

      // 更新帖子计数
      await prisma.post.update({
        where: { id: postId },
        data: {
          [value === 1 ? 'upvotes' : 'downvotes']: { decrement: 1 },
        },
      });

      return { vote: 0 };
    } else {
      // 修改投票
      await prisma.vote.update({
        where: { id: existingVote.id },
        data: { value },
      });

      // 更新帖子计数
      await prisma.post.update({
        where: { id: postId },
        data: {
          upvotes: { increment: value === 1 ? 1 : -1 },
          downvotes: { increment: value === -1 ? 1 : -1 },
        },
      });

      return { vote: value };
    }
  } else {
    // 新投票
    await prisma.vote.create({
      data: { userId, postId, value },
    });

    // 更新帖子计数
    await prisma.post.update({
      where: { id: postId },
      data: {
        [value === 1 ? 'upvotes' : 'downvotes']: { increment: 1 },
      },
    });

    // 如果是点赞，给作者加积分
    if (value === 1 && post.userId !== userId) {
      const { addPoints, POINT_RULES } = await import('./gamification/points');
      await addPoints(post.userId, POINT_RULES.RECEIVE_UPVOTE, 'vote', '收到点赞');
    }

    return { vote: value };
  }
}

// 创建评论
export async function createComment(data: {
  userId: string;
  postId: string;
  content: string;
  parentCommentId?: string;
}) {
  const post = await prisma.post.findUnique({
    where: { id: data.postId },
  });

  if (!post) {
    throw new NotFoundError('帖子不存在');
  }

  if (data.parentCommentId) {
    const parentComment = await prisma.comment.findUnique({
      where: { id: data.parentCommentId },
    });
    if (!parentComment || parentComment.postId !== data.postId) {
      throw new BadRequestError('父评论不存在');
    }
  }

  const comment = await prisma.comment.create({
    data: {
      userId: data.userId,
      postId: data.postId,
      content: data.content,
      parentCommentId: data.parentCommentId,
    },
    include: {
      user: {
        select: { id: true, username: true, avatarUrl: true },
      },
    },
  });

  // 添加评论积分
  const { addPoints, POINT_RULES } = await import('./gamification/points');
  await addPoints(data.userId, POINT_RULES.COMMENT_CREATE, 'comment', '发布评论');

  return comment;
}

// 更新评论
export async function updateComment(commentId: string, userId: string, content: string) {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
  });

  if (!comment) {
    throw new NotFoundError('评论不存在');
  }

  if (comment.userId !== userId) {
    throw new ForbiddenError('只能编辑自己的评论');
  }

  if (!content || content.trim().length === 0) {
    throw new BadRequestError('评论内容不能为空');
  }

  if (content.length > 10000) {
    throw new BadRequestError('评论内容不能超过 10000 个字符');
  }

  return prisma.comment.update({
    where: { id: commentId },
    data: { content },
    include: {
      user: {
        select: { id: true, username: true, avatarUrl: true },
      },
    },
  });
}

// 获取帖子评论
export async function getComments(postId: string, page: number = 1, limit: number = 20) {
  const skip = (page - 1) * limit;

  const [comments, total] = await Promise.all([
    prisma.comment.findMany({
      where: {
        postId,
        parentCommentId: null,
      },
      include: {
        user: {
          select: { id: true, username: true, avatarUrl: true },
        },
        replies: {
          include: {
            user: {
              select: { id: true, username: true, avatarUrl: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'asc' },
    }),
    prisma.comment.count({
      where: { postId, parentCommentId: null },
    }),
  ]);

  return {
    comments,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}
