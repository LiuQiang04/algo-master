import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { prisma } from '../utils/prisma';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { AuthRequest } from '../middleware/auth';

const router = Router();

// 获取所有虚拟物品
router.get('/', async (_req, res) => {
  const items = await prisma.virtualItem.findMany({
    where: { isActive: true },
    orderBy: [{ type: 'asc' }, { price: 'asc' }],
  });

  res.json({
    success: true,
    data: items,
  });
});

// 获取用户物品
router.get('/me', authenticate, async (req: AuthRequest, res) => {
  const userId = req.user!.id;

  const userItems = await prisma.userVirtualItem.findMany({
    where: { userId },
    include: {
      item: true,
    },
    orderBy: { acquiredAt: 'desc' },
  });

  res.json({
    success: true,
    data: userItems,
  });
});

// 购买物品
router.post('/:itemId/buy', authenticate, async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const { itemId } = req.params;

  const item = await prisma.virtualItem.findUnique({
    where: { id: itemId },
  });

  if (!item || !item.isActive) {
    throw new NotFoundError('物品不存在');
  }

  // 检查是否已拥有
  const existing = await prisma.userVirtualItem.findUnique({
    where: {
      userId_itemId: { userId, itemId },
    },
  });

  if (existing) {
    throw new BadRequestError('你已拥有该物品');
  }

  // 检查积分是否足够
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { experiencePoints: true },
  });

  if (!user || user.experiencePoints < item.price) {
    throw new BadRequestError('积分不足');
  }

  // 扣除积分并创建物品记录
  const [userItem] = await prisma.$transaction([
    prisma.userVirtualItem.create({
      data: {
        userId,
        itemId,
      },
      include: { item: true },
    }),
    prisma.user.update({
      where: { id: userId },
      data: {
        experiencePoints: { decrement: item.price },
      },
    }),
    prisma.pointHistory.create({
      data: {
        userId,
        points: -item.price,
        type: 'purchase',
        description: `购买物品: ${item.name}`,
        relatedId: itemId,
      },
    }),
  ]);

  res.json({
    success: true,
    data: userItem,
  });
});

// 装备/卸载物品
router.post('/:itemId/equip', authenticate, async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const { itemId } = req.params;
  const { equip } = req.body;

  const userItem = await prisma.userVirtualItem.findUnique({
    where: {
      userId_itemId: { userId, itemId },
    },
  });

  if (!userItem) {
    throw new NotFoundError('你未拥有该物品');
  }

  // 如果是装备，先卸载同类型的其他物品
  if (equip) {
    const item = await prisma.virtualItem.findUnique({
      where: { id: itemId },
    });

    if (item) {
      await prisma.userVirtualItem.updateMany({
        where: {
          userId,
          isEquipped: true,
          item: { type: item.type },
        },
        data: { isEquipped: false },
      });
    }
  }

  const updated = await prisma.userVirtualItem.update({
    where: { id: userItem.id },
    data: { isEquipped: equip },
    include: { item: true },
  });

  res.json({
    success: true,
    data: updated,
  });
});

export default router;
