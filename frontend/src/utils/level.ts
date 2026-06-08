// 等级经验值配置
const LEVEL_CONFIG = {
  baseExp: 100,        // 1级所需经验
  growthRate: 1.5,     // 增长率
  maxLevel: 100,
};

// 计算升级所需经验值
export function getExpForLevel(level: number): number {
  return Math.floor(LEVEL_CONFIG.baseExp * Math.pow(LEVEL_CONFIG.growthRate, level - 1));
}

// 计算当前等级和进度
export function calculateLevel(experiencePoints: number): {
  level: number;
  currentExp: number;
  nextLevelExp: number;
  progress: number;
  totalExp: number;
} {
  let level = 1;
  let totalExp = 0;

  while (level < LEVEL_CONFIG.maxLevel) {
    const expForLevel = getExpForLevel(level);
    if (totalExp + expForLevel > experiencePoints) {
      break;
    }
    totalExp += expForLevel;
    level++;
  }

  const currentExp = experiencePoints - totalExp;
  const nextLevelExp = getExpForLevel(level);
  const progress = Math.floor((currentExp / nextLevelExp) * 100);

  return { level, currentExp, nextLevelExp, progress, totalExp: experiencePoints };
}

// 获取等级对应的称号
export function getLevelTitle(level: number): string {
  if (level >= 100) return '算法传说';
  if (level >= 80) return '算法宗师';
  if (level >= 60) return '算法大师';
  if (level >= 40) return '算法专家';
  if (level >= 20) return '算法精英';
  if (level >= 10) return '算法探索者';
  if (level >= 5) return '算法学徒';
  return '算法新手';
}

// 获取等级对应的颜色
export function getLevelColor(level: number): string {
  if (level >= 100) return 'from-yellow-400 to-orange-500';
  if (level >= 80) return 'from-purple-400 to-pink-500';
  if (level >= 60) return 'from-blue-400 to-indigo-500';
  if (level >= 40) return 'from-green-400 to-emerald-500';
  if (level >= 20) return 'from-cyan-400 to-blue-500';
  if (level >= 10) return 'from-gray-400 to-gray-500';
  return 'from-gray-300 to-gray-400';
}
