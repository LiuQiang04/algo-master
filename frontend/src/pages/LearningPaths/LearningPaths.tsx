import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Clock,
  Layers,
  CheckCircle2,
  Search,
  TrendingUp,
  Zap,
  ArrowRight,
} from 'lucide-react';
import './LearningPaths.css';

interface LearningPath {
  id: number;
  name: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedHours: number;
  moduleCount: number;
  completedModules: number;
  tags: string[];
  icon: string;
}

const mockPaths: LearningPath[] = [
  {
    id: 1,
    name: '动态规划精通之路',
    description: '从基础的状态定义到复杂的区间DP、树形DP、数位DP，系统掌握动态规划的核心思想与解题技巧。',
    difficulty: 'intermediate',
    estimatedHours: 40,
    moduleCount: 8,
    completedModules: 3,
    tags: ['DP', '背包', '区间', '状态压缩'],
    icon: 'DP',
  },
  {
    id: 2,
    name: '图论算法全解',
    description: '覆盖图的遍历、最短路径、最小生成树、网络流、二分图匹配等核心图论知识。',
    difficulty: 'advanced',
    estimatedHours: 50,
    moduleCount: 10,
    completedModules: 1,
    tags: ['BFS', 'DFS', '最短路', '网络流'],
    icon: 'Graph',
  },
  {
    id: 3,
    name: '数据结构基础',
    description: '学习数组、链表、栈、队列、哈希表、堆等基础数据结构的原理与应用。',
    difficulty: 'beginner',
    estimatedHours: 25,
    moduleCount: 7,
    completedModules: 5,
    tags: ['数组', '链表', '栈', '堆'],
    icon: 'DS',
  },
  {
    id: 4,
    name: '贪心算法进阶',
    description: '掌握贪心策略的设计与证明，学习区间调度、Huffman编码、活动选择等经典问题。',
    difficulty: 'intermediate',
    estimatedHours: 20,
    moduleCount: 5,
    completedModules: 0,
    tags: ['贪心', '区间调度', '排序'],
    icon: 'Greedy',
  },
  {
    id: 5,
    name: '搜索算法实战',
    description: '深度优先搜索、广度优先搜索、剪枝策略、双向搜索、A*算法等搜索技术的系统学习。',
    difficulty: 'intermediate',
    estimatedHours: 30,
    moduleCount: 6,
    completedModules: 2,
    tags: ['DFS', 'BFS', '剪枝', 'A*'],
    icon: 'Search',
  },
  {
    id: 6,
    name: '数学与数论',
    description: '素数筛、快速幂、组合数学、概率期望、博弈论等竞赛数学知识体系。',
    difficulty: 'advanced',
    estimatedHours: 35,
    moduleCount: 9,
    completedModules: 0,
    tags: ['素数', '组合', '博弈', '期望'],
    icon: 'Math',
  },
];

const difficultyLabels = {
  beginner: '入门',
  intermediate: '进阶',
  advanced: '高级',
};

export default function LearningPaths() {
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPaths = mockPaths.filter((p) => {
    const matchesDifficulty =
      difficultyFilter === 'all' || p.difficulty === difficultyFilter;
    const matchesSearch =
      searchQuery === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDifficulty && matchesSearch;
  });

  const getProgressPercent = (path: LearningPath) =>
    path.moduleCount > 0
      ? Math.round((path.completedModules / path.moduleCount) * 100)
      : 0;

  return (
    <div className="lp-page">
      <div className="container">
        {/* Header */}
        <div className="lp-header">
          <div>
            <h1 className="lp-title">学习路径</h1>
            <p className="lp-desc">
              按照系统化的路径学习算法，循序渐进地提升你的编程能力
            </p>
          </div>
          <div className="lp-stats">
            <div className="lp-stat">
              <span className="lp-stat-value">{mockPaths.length}</span>
              <span className="lp-stat-label">条路径</span>
            </div>
            <div className="lp-stat">
              <span className="lp-stat-value">
                {mockPaths.reduce((s, p) => s + p.moduleCount, 0)}
              </span>
              <span className="lp-stat-label">个模块</span>
            </div>
            <div className="lp-stat">
              <span className="lp-stat-value">
                {mockPaths.reduce((s, p) => s + p.completedModules, 0)}
              </span>
              <span className="lp-stat-label">已完成</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="lp-filters">
          <div className="lp-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="搜索学习路径..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="lp-filter-chips">
            {(['all', 'beginner', 'intermediate', 'advanced'] as const).map(
              (level) => (
                <button
                  key={level}
                  className={`lp-chip ${difficultyFilter === level ? 'lp-chip--active' : ''}`}
                  onClick={() => setDifficultyFilter(level)}
                >
                  {level === 'all' ? '全部' : difficultyLabels[level]}
                </button>
              ),
            )}
          </div>
        </div>

        {/* Path Grid */}
        <div className="lp-grid">
          {filteredPaths.map((path) => {
            const percent = getProgressPercent(path);
            return (
              <Link
                key={path.id}
                to={`/learning-paths/${path.id}`}
                className="lp-card"
              >
                <div className="lp-card__icon">{path.icon}</div>
                <div className="lp-card__body">
                  <div className="lp-card__top">
                    <span
                      className={`lp-diff lp-diff--${path.difficulty}`}
                    >
                      {difficultyLabels[path.difficulty]}
                    </span>
                    {percent === 100 && (
                      <span className="lp-completed-badge">
                        <CheckCircle2 size={14} /> 已完成
                      </span>
                    )}
                  </div>
                  <h3 className="lp-card__title">{path.name}</h3>
                  <p className="lp-card__desc">{path.description}</p>

                  <div className="lp-card__tags">
                    {path.tags.map((tag) => (
                      <span key={tag} className="lp-tag">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="lp-card__meta">
                    <span className="lp-meta-item">
                      <Clock size={14} />
                      {path.estimatedHours} 小时
                    </span>
                    <span className="lp-meta-item">
                      <Layers size={14} />
                      {path.moduleCount} 模块
                    </span>
                    <span className="lp-meta-item">
                      <CheckCircle2 size={14} />
                      {path.completedModules}/{path.moduleCount}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="lp-progress">
                    <div className="lp-progress__bar">
                      <div
                        className="lp-progress__fill"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="lp-progress__text">{percent}%</span>
                  </div>

                  <div className="lp-card__action">
                    {percent === 0 ? (
                      <>
                        <Zap size={16} />
                        开始学习
                      </>
                    ) : percent === 100 ? (
                      <>
                        <TrendingUp size={16} />
                        复习回顾
                      </>
                    ) : (
                      <>
                        <ArrowRight size={16} />
                        继续学习
                      </>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredPaths.length === 0 && (
          <div className="lp-empty">
            <BookOpen size={48} />
            <h3>没有找到匹配的学习路径</h3>
            <p>尝试调整筛选条件或搜索关键词</p>
          </div>
        )}
      </div>
    </div>
  );
}
