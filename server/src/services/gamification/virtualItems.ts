import { prisma } from '../../utils/prisma';
import { addPoints } from './points';

// 虚拟物品定义
export const VIRTUAL_ITEM_DEFINITIONS = [
  // ==================== 徽章 ====================
  {
    name: '新手徽章',
    description: '欢迎来到算法竞赛的世界',
    type: 'badge',
    rarity: 'common',
    iconUrl: '/items/badge-newbie.png',
    price: 0,
  },
  {
    name: '青铜徽章',
    description: '达到10级',
    type: 'badge',
    rarity: 'common',
    iconUrl: '/items/badge-bronze.png',
    price: 100,
  },
  {
    name: '白银徽章',
    description: '达到30级',
    type: 'badge',
    rarity: 'rare',
    iconUrl: '/items/badge-silver.png',
    price: 500,
  },
  {
    name: '黄金徽章',
    description: '达到50级',
    type: 'badge',
    rarity: 'epic',
    iconUrl: '/items/badge-gold.png',
    price: 1000,
  },
  {
    name: '钻石徽章',
    description: '达到100级',
    type: 'badge',
    rarity: 'legendary',
    iconUrl: '/items/badge-diamond.png',
    price: 5000,
  },
  {
    name: '解题达人徽章',
    description: '完成100道题目',
    type: 'badge',
    rarity: 'epic',
    iconUrl: '/items/badge-solver.png',
    price: 800,
  },
  {
    name: '竞赛之星徽章',
    description: '在竞赛中获得前3名',
    type: 'badge',
    rarity: 'epic',
    iconUrl: '/items/badge-contest-star.png',
    price: 1200,
  },

  // ==================== 称号 ====================
  {
    name: '算法新手',
    description: '初始称号',
    type: 'title',
    rarity: 'common',
    iconUrl: null,
    price: 0,
  },
  {
    name: '算法学徒',
    description: '达到5级',
    type: 'title',
    rarity: 'common',
    iconUrl: null,
    price: 50,
  },
  {
    name: '算法探索者',
    description: '达到15级',
    type: 'title',
    rarity: 'common',
    iconUrl: null,
    price: 200,
  },
  {
    name: '算法精英',
    description: '达到30级',
    type: 'title',
    rarity: 'rare',
    iconUrl: null,
    price: 500,
  },
  {
    name: '算法大师',
    description: '达到50级',
    type: 'title',
    rarity: 'epic',
    iconUrl: null,
    price: 1000,
  },
  {
    name: '算法传说',
    description: '达到100级',
    type: 'title',
    rarity: 'legendary',
    iconUrl: null,
    price: 5000,
  },
  {
    name: '代码诗人',
    description: '完成50道题目',
    type: 'title',
    rarity: 'rare',
    iconUrl: null,
    price: 600,
  },
  {
    name: '算法之神',
    description: '完成500道题目',
    type: 'title',
    rarity: 'legendary',
    iconUrl: null,
    price: 10000,
  },

  // ==================== 头像框 ====================
  {
    name: '经典头像框',
    description: '简约经典风格',
    type: 'frame',
    rarity: 'common',
    iconUrl: '/items/frame-classic.png',
    price: 0,
  },
  {
    name: '火焰头像框',
    description: '燃烧的火焰效果',
    type: 'frame',
    rarity: 'rare',
    iconUrl: '/items/frame-fire.png',
    price: 300,
  },
  {
    name: '星空头像框',
    description: '闪烁的星空效果',
    type: 'frame',
    rarity: 'epic',
    iconUrl: '/items/frame-stars.png',
    price: 800,
  },
  {
    name: '彩虹头像框',
    description: '绚丽的彩虹效果',
    type: 'frame',
    rarity: 'epic',
    iconUrl: '/items/frame-rainbow.png',
    price: 1000,
  },
  {
    name: '皇家头像框',
    description: '尊贵的皇家风格',
    type: 'frame',
    rarity: 'legendary',
    iconUrl: '/items/frame-royal.png',
    price: 2000,
  },

  // ==================== 主题装饰 ====================
  {
    name: '默认主题',
    description: '清新简约风格',
    type: 'decoration',
    rarity: 'common',
    iconUrl: '/items/theme-default.png',
    price: 0,
  },
  {
    name: '暗黑主题',
    description: '护眼暗黑风格',
    type: 'decoration',
    rarity: 'rare',
    iconUrl: '/items/theme-dark.png',
    price: 500,
  },
  {
    name: '赛博朋克主题',
    description: '未来科技风格',
    type: 'decoration',
    rarity: 'epic',
    iconUrl: '/items/theme-cyberpunk.png',
    price: 1500,
  },
  {
    name: '中国风主题',
    description: '古典中国风格',
    type: 'decoration',
    rarity: 'epic',
    iconUrl: '/items/theme-chinese.png',
    price: 1200,
  },
];

// 初始化虚拟物品
export async function initializeVirtualItems() {
  for (const def of VIRTUAL_ITEM_DEFINITIONS) {
    await prisma.virtualItem.upsert({
      where: { name: def.name },
      update: def,
      create: def,
    });
  }
}

// 获取所有虚拟物品
export async function getAllVirtualItems(type?: string) {
  const where: any = { isActive: true };
  if (type) where.type = type;

  return prisma.virtualItem.findMany({
    where,
    orderBy: [
      { rarity: 'asc' },
      { price: 'asc' },
    ],
  });
}

// 获取用户拥有的物品
export async function getUserItems(userId: string, type?: string) {
  const where: any = { userId };
  if (type) {
    where.item = { type };
  }

  return prisma.userVirtualItem.findMany({
    where,
    include: {
      item: true,
    },
    orderBy: { acquiredAt: 'desc' },
  });
}

// 购买物品
export async function purchaseItem(userId: string, itemId: string) {
  const item = await prisma.virtualItem.findUnique({
    where: { id: itemId },
  });

  if (!item || !item.isActive) {
    throw new Error('Item not found');
  }

  // 检查是否已拥有
  const existing = await prisma.userVirtualItem.findUnique({
    where: {
      userId_itemId: { userId, itemId },
    },
  });

  if (existing) {
    throw new Error('Already owned');
  }

  // 检查积分是否足够
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { experiencePoints: true },
  });

  if (!user) {
    throw new Error('User not found');
  }

  if (user.experiencePoints < item.price) {
    throw new Error('Insufficient points');
  }

  // 扣除积分
  await addPoints(
    userId,
    -item.price,
    'purchase',
    `购买物品: ${item.name}`
  );

  // 授予物品
  const userItem = await prisma.userVirtualItem.create({
    data: {
      userId,
      itemId,
    },
    include: {
      item: true,
    },
  });

  return userItem;
}

// 装备物品
export async function equipItem(userId: string, itemId: string) {
  const userItem = await prisma.userVirtualItem.findUnique({
    where: {
      userId_itemId: { userId, itemId },
    },
    include: { item: true },
  });

  if (!userItem) {
    throw new Error('Item not owned');
  }

  // 取消同类型其他物品的装备
  await prisma.userVirtualItem.updateMany({
    where: {
      userId,
      isEquipped: true,
      item: { type: userItem.item.type },
    },
    data: { isEquipped: false },
  });

  // 装备当前物品
  await prisma.userVirtualItem.update({
    where: {
      userId_itemId: { userId, itemId },
    },
    data: { isEquipped: true },
  });

  // 如果是称号，更新用户称号
  if (userItem.item.type === 'title') {
    await prisma.user.update({
      where: { id: userId },
      data: { title: userItem.item.name },
    });
  }

  return userItem;
}

// 卸下物品
export async function unequipItem(userId: string, itemId: string) {
  const userItem = await prisma.userVirtualItem.findUnique({
    where: {
      userId_itemId: { userId, itemId },
    },
    include: { item: true },
  });

  if (!userItem || !userItem.isEquipped) {
    throw new Error('Item not equipped');
  }

  await prisma.userVirtualItem.update({
    where: {
      userId_itemId: { userId, itemId },
    },
    data: { isEquipped: false },
  });

  // 如果是称号，清除用户称号
  if (userItem.item.type === 'title') {
    await prisma.user.update({
      where: { id: userId },
      data: { title: null },
    });
  }
}

// 获取用户装备的物品
export async function getEquippedItems(userId: string) {
  const equipped = await prisma.userVirtualItem.findMany({
    where: {
      userId,
      isEquipped: true,
    },
    include: { item: true },
  });

  const result: Record<string, any> = {};
  for (const eq of equipped) {
    result[eq.item.type] = eq.item;
  }

  return result;
}
