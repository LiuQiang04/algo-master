import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// 密码加密
async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

// 标签数据
const TAGS = [
  // 算法类型
  { name: '排序', category: '算法' },
  { name: '搜索', category: '算法' },
  { name: '贪心', category: '算法' },
  { name: '动态规划', category: '算法' },
  { name: '分治', category: '算法' },
  { name: '回溯', category: '算法' },
  { name: '图论', category: '算法' },
  { name: '数论', category: '算法' },
  { name: '几何', category: '算法' },
  { name: '字符串', category: '算法' },

  // 数据结构
  { name: '数组', category: '数据结构' },
  { name: '链表', category: '数据结构' },
  { name: '栈', category: '数据结构' },
  { name: '队列', category: '数据结构' },
  { name: '哈希表', category: '数据结构' },
  { name: '树', category: '数据结构' },
  { name: '图', category: '数据结构' },
  { name: '堆', category: '数据结构' },
  { name: '并查集', category: '数据结构' },
  { name: '线段树', category: '数据结构' },

  // 难度标签
  { name: '入门', category: '难度' },
  { name: '基础', category: '难度' },
  { name: '进阶', category: '难度' },
  { name: '挑战', category: '难度' },
  { name: '竞赛', category: '难度' },
];

// 题目数据
const PROBLEMS = [
  {
    title: 'A + B Problem',
    description: '计算两个整数A和B的和。\n\n输入两个整数A和B，输出它们的和。',
    inputFormat: '一行，包含两个整数A和B，用空格分隔。',
    outputFormat: '一行，包含一个整数，表示A和B的和。',
    sampleInput: '1 2',
    sampleOutput: '3',
    difficulty: 1,
    timeLimit: 1000,
    memoryLimit: 256,
    tags: ['入门', '数组'],
    testCases: [
      { input: '1 2', expectedOutput: '3', isSample: true },
      { input: '10 20', expectedOutput: '30', isSample: false },
      { input: '-1 1', expectedOutput: '0', isSample: false },
      { input: '100 200', expectedOutput: '300', isSample: false },
    ],
  },
  {
    title: '斐波那契数列',
    description: '斐波那契数列定义如下：\n\nF(0) = 0\nF(1) = 1\nF(n) = F(n-1) + F(n-2) (n >= 2)\n\n给定一个整数n，求F(n)。',
    inputFormat: '一个整数n (0 <= n <= 45)',
    outputFormat: '一个整数，表示F(n)',
    sampleInput: '10',
    sampleOutput: '55',
    difficulty: 2,
    timeLimit: 1000,
    memoryLimit: 256,
    tags: ['动态规划', '入门'],
    testCases: [
      { input: '0', expectedOutput: '0', isSample: true },
      { input: '1', expectedOutput: '1', isSample: true },
      { input: '10', expectedOutput: '55', isSample: true },
      { input: '20', expectedOutput: '6765', isSample: false },
    ],
  },
  {
    title: '两数之和',
    description: '给定一个整数数组nums和一个目标值target，请找出数组中和为目标值的两个数的下标。\n\n假设每个输入只有一个解决方案，且同一个元素不能使用两次。',
    inputFormat: '第一行：整数数组nums，元素用空格分隔\n第二行：目标值target',
    outputFormat: '两个整数，表示两个数的下标，用空格分隔（下标从小到大）',
    sampleInput: '2 7 11 15\n9',
    sampleOutput: '0 1',
    difficulty: 2,
    timeLimit: 1000,
    memoryLimit: 256,
    tags: ['哈希表', '数组'],
    testCases: [
      { input: '2 7 11 15\n9', expectedOutput: '0 1', isSample: true },
      { input: '3 2 4\n6', expectedOutput: '1 2', isSample: false },
      { input: '3 3\n6', expectedOutput: '0 1', isSample: false },
    ],
  },
  {
    title: '反转链表',
    description: '给定一个单链表，请将其反转。\n\n例如：1->2->3->4->5 变为 5->4->3->2->1',
    inputFormat: '第一行：链表长度n\n第二行：n个整数，表示链表节点的值',
    outputFormat: '反转后的链表，节点值用空格分隔',
    sampleInput: '5\n1 2 3 4 5',
    sampleOutput: '5 4 3 2 1',
    difficulty: 2,
    timeLimit: 1000,
    memoryLimit: 256,
    tags: ['链表', '基础'],
    testCases: [
      { input: '5\n1 2 3 4 5', expectedOutput: '5 4 3 2 1', isSample: true },
      { input: '1\n1', expectedOutput: '1', isSample: false },
      { input: '2\n1 2', expectedOutput: '2 1', isSample: false },
    ],
  },
  {
    title: '最长公共子序列',
    description: '给定两个字符串text1和text2，返回这两个字符串的最长公共子序列的长度。\n\n子序列是指不改变剩余字符顺序的情况下，删除某些字符（也可以不删除）后组成的新字符串。',
    inputFormat: '两行，每行一个字符串',
    outputFormat: '一个整数，表示最长公共子序列的长度',
    sampleInput: 'abcde\nace',
    sampleOutput: '3',
    difficulty: 3,
    timeLimit: 1000,
    memoryLimit: 256,
    tags: ['动态规划', '字符串'],
    testCases: [
      { input: 'abcde\nace', expectedOutput: '3', isSample: true },
      { input: 'abc\nabc', expectedOutput: '3', isSample: false },
      { input: 'abc\ndef', expectedOutput: '0', isSample: false },
    ],
  },
  {
    title: '二叉树的层序遍历',
    description: '给定一棵二叉树，返回其按层序遍历的节点值。（即逐层地，从左到右访问所有节点）',
    inputFormat: '第一行：树的节点数n\n第二行：n个整数，表示节点值（-1表示空节点）',
    outputFormat: '每行一层的节点值，用空格分隔',
    sampleInput: '7\n3 9 20 -1 -1 15 7',
    sampleOutput: '3\n9 20\n15 7',
    difficulty: 3,
    timeLimit: 1000,
    memoryLimit: 256,
    tags: ['树', '队列', '搜索'],
    testCases: [
      { input: '7\n3 9 20 -1 -1 15 7', expectedOutput: '3\n9 20\n15 7', isSample: true },
      { input: '1\n1', expectedOutput: '1', isSample: false },
      { input: '0\n', expectedOutput: '', isSample: false },
    ],
  },
  {
    title: '最短路径问题',
    description: '给定一个有向图，求从起点到终点的最短路径长度。\n\n使用Dijkstra算法解决。',
    inputFormat: '第一行：n m（节点数和边数）\n接下来m行：u v w（从u到v的边，权重为w）\n最后一行：s t（起点和终点）',
    outputFormat: '最短路径长度，如果不存在路径输出-1',
    sampleInput: '5 6\n1 2 2\n1 3 4\n2 3 1\n2 4 7\n3 5 3\n4 5 1\n1 5',
    sampleOutput: '6',
    difficulty: 4,
    timeLimit: 2000,
    memoryLimit: 512,
    tags: ['图论', '搜索', '进阶'],
    testCases: [
      { input: '5 6\n1 2 2\n1 3 4\n2 3 1\n2 4 7\n3 5 3\n4 5 1\n1 5', expectedOutput: '6', isSample: true },
      { input: '3 2\n1 2 1\n2 3 2\n1 3', expectedOutput: '3', isSample: false },
    ],
  },
  {
    title: '背包问题',
    description: '有N件物品和一个容量为V的背包。第i件物品的费用是c[i]，价值是w[i]。\n\n求解将哪些物品装入背包可使价值总和最大。',
    inputFormat: '第一行：N V（物品数和背包容量）\n接下来N行：c[i] w[i]（费用和价值）',
    outputFormat: '最大价值',
    sampleInput: '4 5\n1 2\n2 4\n3 4\n4 5',
    sampleOutput: '8',
    difficulty: 3,
    timeLimit: 1000,
    memoryLimit: 256,
    tags: ['动态规划', '挑战'],
    testCases: [
      { input: '4 5\n1 2\n2 4\n3 4\n4 5', expectedOutput: '8', isSample: true },
      { input: '3 4\n1 1\n2 3\n3 4', expectedOutput: '4', isSample: false },
    ],
  },
  {
    title: '合并区间',
    description: '给出一组区间，请将所有重叠的区间合并。\n\n例如：[[1,3],[2,6],[8,10],[15,18]] 合并为 [[1,6],[8,10],[15,18]]',
    inputFormat: '第一行：区间数量n\n接下来n行：每行两个整数l r，表示区间[l,r]',
    outputFormat: '合并后的区间，每行一个',
    sampleInput: '4\n1 3\n2 6\n8 10\n15 18',
    sampleOutput: '1 6\n8 10\n15 18',
    difficulty: 3,
    timeLimit: 1000,
    memoryLimit: 256,
    tags: ['排序', '贪心', '数组'],
    testCases: [
      { input: '4\n1 3\n2 6\n8 10\n15 18', expectedOutput: '1 6\n8 10\n15 18', isSample: true },
      { input: '2\n1 4\n2 3', expectedOutput: '1 4', isSample: false },
    ],
  },
  {
    title: 'N皇后问题',
    description: 'N皇后问题是指在N×N的棋盘上放置N个皇后，使得它们互不攻击。\n\n请输出所有可能的放置方案数。',
    inputFormat: '一个整数N (1 <= N <= 12)',
    outputFormat: '一个整数，表示方案数',
    sampleInput: '4',
    sampleOutput: '2',
    difficulty: 5,
    timeLimit: 5000,
    memoryLimit: 512,
    tags: ['回溯', '挑战', '竞赛'],
    testCases: [
      { input: '4', expectedOutput: '2', isSample: true },
      { input: '8', expectedOutput: '92', isSample: false },
      { input: '1', expectedOutput: '1', isSample: false },
    ],
  },
];

// 成就数据
const ACHIEVEMENTS = [
  // 解题成就
  {
    name: '初出茅庐',
    description: '完成第一道题目',
    category: 'problem',
    rarity: 'common',
    points: 10,
    requirement: { type: 'solve_count', value: 1 },
  },
  {
    name: '小试牛刀',
    description: '完成10道题目',
    category: 'problem',
    rarity: 'common',
    points: 20,
    requirement: { type: 'solve_count', value: 10 },
  },
  {
    name: '算法新星',
    description: '完成50道题目',
    category: 'problem',
    rarity: 'rare',
    points: 50,
    requirement: { type: 'solve_count', value: 50 },
  },
  {
    name: '算法达人',
    description: '完成100道题目',
    category: 'problem',
    rarity: 'epic',
    points: 100,
    requirement: { type: 'solve_count', value: 100 },
  },
  {
    name: '算法大师',
    description: '完成500道题目',
    category: 'problem',
    rarity: 'legendary',
    points: 200,
    requirement: { type: 'solve_count', value: 500 },
  },
  // 竞赛成就
  {
    name: '竞赛新手',
    description: '参加第一次竞赛',
    category: 'contest',
    rarity: 'common',
    points: 15,
    requirement: { type: 'contest_count', value: 1 },
  },
  {
    name: '竞赛常客',
    description: '参加10次竞赛',
    category: 'contest',
    rarity: 'rare',
    points: 50,
    requirement: { type: 'contest_count', value: 10 },
  },
  // 学习成就
  {
    name: '持之以恒',
    description: '连续登录7天',
    category: 'learning',
    rarity: 'common',
    points: 30,
    requirement: { type: 'login_streak', value: 7 },
  },
  {
    name: '月度坚持',
    description: '连续登录30天',
    category: 'learning',
    rarity: 'rare',
    points: 100,
    requirement: { type: 'login_streak', value: 30 },
  },
  // 等级成就
  {
    name: '等级达人',
    description: '达到10级',
    category: 'level',
    rarity: 'rare',
    points: 50,
    requirement: { type: 'reach_level', value: 10 },
  },
];

// 虚拟物品数据
const VIRTUAL_ITEMS = [
  // 徽章
  {
    name: '新手徽章',
    description: '欢迎来到算法竞赛的世界',
    type: 'badge',
    rarity: 'common',
    price: 0,
  },
  {
    name: '勤奋徽章',
    description: '连续登录7天获得',
    type: 'badge',
    rarity: 'common',
    price: 100,
  },
  {
    name: '算法达人徽章',
    description: '完成100道题目获得',
    type: 'badge',
    rarity: 'rare',
    price: 500,
  },
  // 称号
  {
    name: '初学者',
    description: '算法竞赛新手',
    type: 'title',
    rarity: 'common',
    price: 0,
  },
  {
    name: '算法探索者',
    description: '正在探索算法的世界',
    type: 'title',
    rarity: 'common',
    price: 200,
  },
  {
    name: '代码高手',
    description: '编程能力出众',
    type: 'title',
    rarity: 'rare',
    price: 1000,
  },
  // 头像框
  {
    name: '简约边框',
    description: '简洁大方的头像边框',
    type: 'frame',
    rarity: 'common',
    price: 150,
  },
  {
    name: '金色边框',
    description: '闪耀的金色头像边框',
    type: 'frame',
    rarity: 'rare',
    price: 800,
  },
];

async function main() {
  console.log('Seeding database...');

  // 清空现有数据（按外键依赖顺序）
  console.log('Clearing existing data...');
  await prisma.$executeRaw`TRUNCATE TABLE daily_challenge_completions CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE daily_challenges CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE notifications CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE friendships CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE user_virtual_items CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE virtual_items CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE login_streaks CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE point_history CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE user_achievements CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE achievements CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE votes CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE comments CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE posts CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE contest_participants CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE contest_problems CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE contests CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE submissions CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE test_cases CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE problem_tags CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE problems CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE tags CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE users CASCADE`;

  // 创建标签
  console.log('Creating tags...');
  const tagMap: Record<string, string> = {};
  for (const tag of TAGS) {
    const created = await prisma.tag.create({ data: tag });
    tagMap[tag.name] = created.id;
  }

  // 创建管理员用户
  console.log('Creating admin user...');
  const adminPassword = await hashPassword('Admin123456');
  const admin = await prisma.user.create({
    data: {
      username: 'admin',
      email: 'admin@algoarena.com',
      passwordHash: adminPassword,
      role: 'ADMIN',
      level: 50,
      experiencePoints: 50000,
      rating: 2500,
    },
  });

  // 创建测试用户
  console.log('Creating test users...');
  const testPassword = await hashPassword('Test123456');
  const testUsers = [];
  const usernames = ['alice', 'bob', 'charlie', 'diana', 'eve'];
  for (let i = 0; i < usernames.length; i++) {
    const user = await prisma.user.create({
      data: {
        username: usernames[i],
        email: `${usernames[i]}@example.com`,
        passwordHash: testPassword,
        level: Math.floor(Math.random() * 20) + 1,
        experiencePoints: Math.floor(Math.random() * 10000),
        rating: 1500 + Math.floor(Math.random() * 500),
        bio: `我是${usernames[i]}，热爱算法竞赛！`,
      },
    });
    testUsers.push(user);
  }

  // 创建题目
  console.log('Creating problems...');
  const problemRecords = [];
  for (const problemData of PROBLEMS) {
    const { tags, testCases, ...data } = problemData;

    const problem = await prisma.problem.create({
      data: {
        ...data,
        authorId: admin.id,
        // 创建标签关联
        tags: {
          create: tags.map((tagName) => ({
            tagId: tagMap[tagName],
          })),
        },
        // 创建测试用例
        testCases: {
          create: testCases,
        },
      },
    });

    problemRecords.push(problem);
  }

  // 创建提交记录
  console.log('Creating submissions...');
  const statuses = ['accepted', 'wrong_answer', 'time_limit_exceeded', 'runtime_error'];
  for (const user of testUsers) {
    for (let i = 0; i < 5; i++) {
      const problem = problemRecords[Math.floor(Math.random() * problemRecords.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      await prisma.submission.create({
        data: {
          userId: user.id,
          problemId: problem.id,
          language: ['cpp', 'java', 'python'][Math.floor(Math.random() * 3)],
          sourceCode: `// Solution for ${problem.title}\n// By ${user.username}`,
          status,
          score: status === 'accepted' ? 100 : Math.floor(Math.random() * 50),
          executionTime: Math.floor(Math.random() * 1000),
          memoryUsed: Math.floor(Math.random() * 100000),
        },
      });
    }
  }

  // 创建竞赛
  console.log('Creating contests...');
  const now = new Date();
  const contest1 = await prisma.contest.create({
    data: {
      title: '周赛 #1',
      description: '每周算法竞赛，挑战你的编程能力！',
      startTime: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 一周后
      endTime: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 持续2小时
      creatorId: admin.id,
      maxParticipants: 100,
      problems: {
        create: [
          { problemId: problemRecords[0].id, problemOrder: 'A', score: 100 },
          { problemId: problemRecords[1].id, problemOrder: 'B', score: 200 },
          { problemId: problemRecords[2].id, problemOrder: 'C', score: 300 },
        ],
      },
    },
  });

  // 创建帖子
  console.log('Creating posts...');
  await prisma.post.create({
    data: {
      userId: testUsers[0].id,
      title: '动态规划入门指南',
      content: '动态规划是算法竞赛中非常重要的一个知识点...\n\n本文将从最基础的概念开始，逐步讲解动态规划的核心思想和常见题型。',
      postType: 'solution',
      problemId: problemRecords[4].id,
      upvotes: 15,
    },
  });

  await prisma.post.create({
    data: {
      userId: testUsers[1].id,
      title: '如何准备算法竞赛？',
      content: '大家好，我是新手，请问如何准备算法竞赛？\n\n需要学习哪些知识？有什么推荐的练习平台吗？',
      postType: 'question',
      upvotes: 8,
    },
  });

  await prisma.post.create({
    data: {
      userId: admin.id,
      title: '欢迎来到算法竞赛学习网站！',
      content: '欢迎大家！这是一个帮助大家学习和准备算法竞赛的平台。\n\n在这里你可以：\n1. 练习各种算法题目\n2. 参加在线竞赛\n3. 与其他学习者交流\n4. 跟踪你的学习进度\n\n祝大家学习愉快！',
      postType: 'announcement',
      upvotes: 50,
    },
  });

  // 创建成就
  console.log('Creating achievements...');
  for (const achievement of ACHIEVEMENTS) {
    await prisma.achievement.create({ data: achievement });
  }

  // 创建虚拟物品
  console.log('Creating virtual items...');
  for (const item of VIRTUAL_ITEMS) {
    await prisma.virtualItem.create({ data: item });
  }

  // 给测试用户一些成就
  console.log('Granting achievements to test users...');
  const achievements = await prisma.achievement.findMany();
  const firstAchievement = achievements.find((a) => a.name === '初出茅庐');
  if (firstAchievement) {
    for (const user of testUsers) {
      await prisma.userAchievement.create({
        data: {
          userId: user.id,
          achievementId: firstAchievement.id,
        },
      });
    }
  }

  console.log('Seeding completed!');
  console.log(`Created ${TAGS.length} tags`);
  console.log(`Created ${PROBLEMS.length} problems`);
  console.log(`Created ${testUsers.length + 1} users (including admin)`);
  console.log(`Created ${ACHIEVEMENTS.length} achievements`);
  console.log(`Created ${VIRTUAL_ITEMS.length} virtual items`);
  console.log('');
  console.log('Admin credentials:');
  console.log('  Email: admin@algoarena.com');
  console.log('  Password: Admin123456');
  console.log('');
  console.log('Test user credentials:');
  console.log('  Email: alice@example.com');
  console.log('  Password: Test123456');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
