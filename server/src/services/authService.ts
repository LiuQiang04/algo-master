import { prisma } from '../utils/prisma';
import { hashPassword, comparePassword, validatePasswordStrength } from '../utils/password';
import { generateToken, generateRefreshToken, JwtPayload } from '../utils/jwt';
import { BadRequestError, UnauthorizedError, ConflictError, NotFoundError } from '../utils/errors';

// 注册
export async function register(data: {
  username: string;
  email: string;
  password: string;
}) {
  const { username, email, password } = data;

  // 验证密码强度
  const passwordValidation = validatePasswordStrength(password);
  if (!passwordValidation.valid) {
    throw new BadRequestError(passwordValidation.errors.join('; '));
  }

  // 检查用户名是否已存在
  const existingUsername = await prisma.user.findUnique({
    where: { username },
  });
  if (existingUsername) {
    throw new ConflictError('用户名已存在');
  }

  // 检查邮箱是否已存在
  const existingEmail = await prisma.user.findUnique({
    where: { email },
  });
  if (existingEmail) {
    throw new ConflictError('邮箱已被注册');
  }

  // 加密密码
  const passwordHash = await hashPassword(password);

  // 创建用户
  const user = await prisma.user.create({
    data: {
      username,
      email,
      passwordHash,
    },
    select: {
      id: true,
      username: true,
      email: true,
      avatarUrl: true,
      rating: true,
      experiencePoints: true,
      level: true,
      createdAt: true,
    },
  });

  // 生成令牌
  const payload: JwtPayload = {
    id: user.id,
    username: user.username,
    email: user.email,
    role: 'USER',
  };

  return {
    user,
    accessToken: generateToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
}

// 登录
export async function login(data: { email: string; password: string }) {
  const { email, password } = data;

  // 查找用户
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new UnauthorizedError('邮箱或密码错误');
  }

  // 验证密码
  const isValidPassword = await comparePassword(password, user.passwordHash);
  if (!isValidPassword) {
    throw new UnauthorizedError('邮箱或密码错误');
  }

  // 更新登录连续天数
  await updateLoginStreak(user.id);

  // 生成令牌
  const payload: JwtPayload = {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
  };

  return {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      avatarUrl: user.avatarUrl,
      rating: user.rating,
      experiencePoints: user.experiencePoints,
      level: user.level,
      role: user.role,
    },
    accessToken: generateToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
}

// 刷新令牌
export async function refreshToken(token: string) {
  try {
    const { verifyToken } = await import('../utils/jwt');
    const decoded = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, username: true, email: true, role: true },
    });

    if (!user) {
      throw new UnauthorizedError('用户不存在');
    }

    const payload: JwtPayload = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    return {
      accessToken: generateToken(payload),
      refreshToken: generateRefreshToken(payload),
    };
  } catch {
    throw new UnauthorizedError('无效的刷新令牌');
  }
}

// 更新登录连续天数
async function updateLoginStreak(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // 检查今天的登录记录
  const todayStreak = await prisma.loginStreak.findUnique({
    where: {
      userId_loginDate: {
        userId,
        loginDate: today,
      },
    },
  });

  if (todayStreak) {
    return; // 今天已经登录过
  }

  // 检查昨天的登录记录
  const yesterdayStreak = await prisma.loginStreak.findUnique({
    where: {
      userId_loginDate: {
        userId,
        loginDate: yesterday,
      },
    },
  });

  const streakDays = yesterdayStreak ? yesterdayStreak.streakDays + 1 : 1;

  // 创建今天的登录记录
  await prisma.loginStreak.create({
    data: {
      userId,
      loginDate: today,
      streakDays,
    },
  });

  // 如果连续登录7天或30天，给予奖励
  if (streakDays === 7 || streakDays === 30) {
    const { addPoints, POINT_RULES } = await import('./gamification/points');
    const bonusPoints = streakDays === 7
      ? POINT_RULES.LOGIN_STREAK_7
      : POINT_RULES.LOGIN_STREAK_30;

    await addPoints(userId, bonusPoints, 'login_streak', `连续登录${streakDays}天奖励`);
  }
}

// 修改密码
export async function changePassword(
  userId: string,
  oldPassword: string,
  newPassword: string
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundError('用户不存在');
  }

  // 验证旧密码
  const isValid = await comparePassword(oldPassword, user.passwordHash);
  if (!isValid) {
    throw new BadRequestError('旧密码错误');
  }

  // 验证新密码强度
  const validation = validatePasswordStrength(newPassword);
  if (!validation.valid) {
    throw new BadRequestError(validation.errors.join('; '));
  }

  // 更新密码
  const passwordHash = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });

  return { message: '密码修改成功' };
}

// 忘记密码（发送重置邮件 - 这里只生成token）
export async function forgotPassword(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    // 为了安全，不暴露用户是否存在
    return { message: '如果该邮箱存在，我们已发送重置链接' };
  }

  // TODO: 发送重置密码邮件
  // 这里可以集成邮件服务

  return { message: '如果该邮箱存在，我们已发送重置链接' };
}
