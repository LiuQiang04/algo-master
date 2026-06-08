import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ChevronLeft,
  Clock,
  Layers,
  CheckCircle2,
  Circle,
  BookOpen,
  Target,
  ArrowRight,
  Lock,
  Play,
} from 'lucide-react';
import './LearningPaths.css';

/* ---------- types ---------- */

interface ModuleProblem {
  id: number;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  completed: boolean;
}

interface Module {
  id: number;
  name: string;
  description: string;
  status: 'completed' | 'in_progress' | 'locked';
  problems: ModuleProblem[];
  knowledgePoints: string[];
}

interface PathDetail {
  id: number;
  name: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedHours: number;
  objectives: string[];
  modules: Module[];
}

/* ---------- mock data ---------- */

const mockPathDetail: PathDetail = {
  id: 1,
  name: '动态规划精通之路',
  description:
    '从基础的状态定义到复杂的区间DP、树形DP、数位DP，系统掌握动态规划的核心思想与解题技巧。本路径将带你从零开始，逐步深入动态规划的世界。',
  difficulty: 'intermediate',
  estimatedHours: 40,
  objectives: [
    '理解动态规划的核心思想：最优子结构与重叠子问题',
    '掌握状态定义与转移方程的设计方法',
    '熟练运用背包问题的各种变体',
    '能够解决区间DP、树形DP、数位DP等高级问题',
    '在竞赛中快速识别并解决动态规划类题目',
  ],
  modules: [
    {
      id: 1,
      name: 'DP 基础入门',
      description: '理解什么是动态规划，学习最简单的DP问题：斐波那契数列、爬楼梯等。',
      status: 'completed',
      problems: [
        { id: 101, title: '斐波那契数列', difficulty: 'easy', completed: true },
        { id: 102, title: '爬楼梯', difficulty: 'easy', completed: true },
        { id: 103, title: '使用最小花费爬楼梯', difficulty: 'easy', completed: true },
      ],
      knowledgePoints: ['递推关系', '记忆化搜索', '状态定义'],
    },
    {
      id: 2,
      name: '线性DP',
      description: '学习一维线性DP问题，包括最长递增子序列、最大子数组和等经典问题。',
      status: 'completed',
      problems: [
        { id: 201, title: '最长递增子序列', difficulty: 'medium', completed: true },
        { id: 202, title: '最大子数组和', difficulty: 'medium', completed: true },
        { id: 203, title: '最长公共子序列', difficulty: 'medium', completed: true },
        { id: 204, title: '编辑距离', difficulty: 'medium', completed: true },
      ],
      knowledgePoints: ['LIS', 'LCS', '子数组 vs 子序列'],
    },
    {
      id: 3,
      name: '背包问题',
      description: '系统学习0-1背包、完全背包、多重背包、分组背包等各种背包问题。',
      status: 'completed',
      problems: [
        { id: 301, title: '0-1 背包问题', difficulty: 'medium', completed: true },
        { id: 302, title: '完全背包问题', difficulty: 'medium', completed: true },
        { id: 303, title: '零钱兑换', difficulty: 'medium', completed: true },
        { id: 304, title: '目标和', difficulty: 'medium', completed: true },
        { id: 305, title: '多重背包问题', difficulty: 'hard', completed: true },
      ],
      knowledgePoints: ['0-1背包', '完全背包', '空间优化', '滚动数组'],
    },
    {
      id: 4,
      name: '区间DP',
      description: '学习区间上的动态规划，包括矩阵链乘法、石子合并、戳气球等问题。',
      status: 'in_progress',
      problems: [
        { id: 401, title: '矩阵链乘法', difficulty: 'hard', completed: true },
        { id: 402, title: '石子合并', difficulty: 'hard', completed: false },
        { id: 403, title: '戳气球', difficulty: 'hard', completed: false },
        { id: 404, title: '奇怪的打印机', difficulty: 'hard', completed: false },
      ],
      knowledgePoints: ['区间枚举', '四边形不等式优化', '环形处理'],
    },
    {
      id: 5,
      name: '树形DP',
      description: '在树结构上进行动态规划，学习树的直径、最大独立集等问题。',
      status: 'locked',
      problems: [
        { id: 501, title: '树的直径', difficulty: 'medium', completed: false },
        { id: 502, title: '二叉树中的最大路径和', difficulty: 'hard', completed: false },
        { id: 503, title: '没有上司的舞会', difficulty: 'medium', completed: false },
        { id: 504, title: '树的最大独立集', difficulty: 'hard', completed: false },
      ],
      knowledgePoints: ['树上DFS', '子树合并', '换根DP'],
    },
    {
      id: 6,
      name: '状态压缩DP',
      description: '使用二进制表示状态，解决集合相关的动态规划问题。',
      status: 'locked',
      problems: [
        { id: 601, title: '旅行商问题(TSP)', difficulty: 'hard', completed: false },
        { id: 602, title: '互不侵犯的方案数', difficulty: 'hard', completed: false },
        { id: 603, title: '玉米田', difficulty: 'medium', completed: false },
      ],
      knowledgePoints: ['位运算', '子集枚举', '轮廓线DP'],
    },
    {
      id: 7,
      name: '数位DP',
      description: '统计满足特定条件的数字个数，学习数位DP的基本框架。',
      status: 'locked',
      problems: [
        { id: 701, title: '不含连续1的非负整数', difficulty: 'hard', completed: false },
        { id: 702, title: '数字中1的个数', difficulty: 'hard', completed: false },
        { id: 703, title: 'Windy数', difficulty: 'hard', completed: false },
      ],
      knowledgePoints: ['数位拆分', '前导零处理', '记忆化搜索'],
    },
    {
      id: 8,
      name: 'DP 综合实战',
      description: '综合运用各种DP技巧解决高难度竞赛题目。',
      status: 'locked',
      problems: [
        { id: 801, title: '正则表达式匹配', difficulty: 'hard', completed: false },
        { id: 802, title: '通配符匹配', difficulty: 'hard', completed: false },
        { id: 803, title: '交错字符串', difficulty: 'medium', completed: false },
        { id: 804, title: '超级丑数', difficulty: 'hard', completed: false },
      ],
      knowledgePoints: ['混合DP', '优化技巧', '竞赛实战'],
    },
  ],
};

const difficultyLabels: Record<string, string> = {
  beginner: '入门',
  intermediate: '进阶',
  advanced: '高级',
  easy: '简单',
  medium: '中等',
  hard: '困难',
};

/* ---------- component ---------- */

export default function LearningPathDetail() {
  const { id: _id } = useParams();
  const [activeTab, setActiveTab] = useState<'modules' | 'objectives' | 'graph'>('modules');

  const path = mockPathDetail;
  const totalProblems = path.modules.reduce((s, m) => s + m.problems.length, 0);
  const completedProblems = path.modules.reduce(
    (s, m) => s + m.problems.filter((p) => p.completed).length,
    0,
  );
  const completedModules = path.modules.filter((m) => m.status === 'completed').length;
  const progressPercent =
    path.modules.length > 0
      ? Math.round((completedModules / path.modules.length) * 100)
      : 0;

  const allKnowledgePoints = [
    ...new Set(path.modules.flatMap((m) => m.knowledgePoints)),
  ];

  return (
    <div className="lp-page">
      <div className="container">
        {/* Back */}
        <Link to="/learning-paths" className="lp-back">
          <ChevronLeft size={18} />
          返回学习路径
        </Link>

        {/* Path Header */}
        <div className="lpd-header">
          <div className="lpd-header__left">
            <span className={`lp-diff lp-diff--${path.difficulty}`}>
              {difficultyLabels[path.difficulty]}
            </span>
            <h1 className="lpd-title">{path.name}</h1>
            <p className="lpd-desc">{path.description}</p>
            <div className="lpd-meta">
              <span className="lp-meta-item">
                <Clock size={14} />
                预计 {path.estimatedHours} 小时
              </span>
              <span className="lp-meta-item">
                <Layers size={14} />
                {path.modules.length} 个模块
              </span>
              <span className="lp-meta-item">
                <BookOpen size={14} />
                {totalProblems} 道题目
              </span>
            </div>
          </div>
          <div className="lpd-header__right">
            <div className="lpd-progress-ring">
              <svg viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="52" className="lpd-ring-bg" />
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  className="lpd-ring-fill"
                  strokeDasharray={`${2 * Math.PI * 52}`}
                  strokeDashoffset={`${2 * Math.PI * 52 * (1 - progressPercent / 100)}`}
                />
              </svg>
              <div className="lpd-ring-text">
                <span className="lpd-ring-value">{progressPercent}%</span>
                <span className="lpd-ring-label">完成</span>
              </div>
            </div>
            <div className="lpd-progress-stats">
              <div className="lpd-pstat">
                <CheckCircle2 size={14} />
                <span>{completedModules}/{path.modules.length} 模块</span>
              </div>
              <div className="lpd-pstat">
                <Target size={14} />
                <span>{completedProblems}/{totalProblems} 题目</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="cd-tabs">
          <button
            className={`cd-tab ${activeTab === 'modules' ? 'cd-tab--active' : ''}`}
            onClick={() => setActiveTab('modules')}
          >
            学习模块
          </button>
          <button
            className={`cd-tab ${activeTab === 'objectives' ? 'cd-tab--active' : ''}`}
            onClick={() => setActiveTab('objectives')}
          >
            学习目标
          </button>
          <button
            className={`cd-tab ${activeTab === 'graph' ? 'cd-tab--active' : ''}`}
            onClick={() => setActiveTab('graph')}
          >
            知识图谱
          </button>
        </div>

        {/* Modules Tab */}
        {activeTab === 'modules' && (
          <div className="lpd-modules">
            {path.modules.map((mod, idx) => {
              const modCompleted = mod.problems.filter((p) => p.completed).length;
              const modTotal = mod.problems.length;
              const modPercent =
                modTotal > 0 ? Math.round((modCompleted / modTotal) * 100) : 0;

              return (
                <div
                  key={mod.id}
                  className={`lpd-module lpd-module--${mod.status}`}
                >
                  {/* Connector line */}
                  {idx < path.modules.length - 1 && (
                    <div className="lpd-module__connector" />
                  )}

                  {/* Step indicator */}
                  <div className="lpd-module__step">
                    {mod.status === 'completed' && (
                      <CheckCircle2 size={24} className="lpd-step-icon lpd-step-icon--done" />
                    )}
                    {mod.status === 'in_progress' && (
                      <Play size={24} className="lpd-step-icon lpd-step-icon--active" />
                    )}
                    {mod.status === 'locked' && (
                      <Lock size={24} className="lpd-step-icon lpd-step-icon--locked" />
                    )}
                  </div>

                  {/* Module content */}
                  <div className="lpd-module__content">
                    <div className="lpd-module__header">
                      <div>
                        <span className="lpd-module__index">模块 {idx + 1}</span>
                        <h3 className="lpd-module__title">{mod.name}</h3>
                      </div>
                      <span className={`lpd-module__status lpd-module__status--${mod.status}`}>
                        {mod.status === 'completed'
                          ? '已完成'
                          : mod.status === 'in_progress'
                            ? '进行中'
                            : '未解锁'}
                      </span>
                    </div>

                    <p className="lpd-module__desc">{mod.description}</p>

                    {/* Knowledge points */}
                    <div className="lpd-module__kp">
                      {mod.knowledgePoints.map((kp) => (
                        <span key={kp} className="lp-kp-tag">
                          {kp}
                        </span>
                      ))}
                    </div>

                    {/* Problems list */}
                    <div className="lpd-module__problems">
                      {mod.problems.map((prob) => (
                        <div
                          key={prob.id}
                          className={`lpd-problem ${prob.completed ? 'lpd-problem--done' : ''}`}
                        >
                          {prob.completed ? (
                            <CheckCircle2 size={16} className="lpd-problem-check" />
                          ) : (
                            <Circle size={16} className="lpd-problem-circle" />
                          )}
                          <span className="lpd-problem__title">{prob.title}</span>
                          <span
                            className={`difficulty-badge difficulty-badge--${prob.difficulty}`}
                          >
                            {difficultyLabels[prob.difficulty]}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Module progress */}
                    <div className="lpd-module__footer">
                      <div className="lp-progress" style={{ flex: 1 }}>
                        <div className="lp-progress__bar">
                          <div
                            className="lp-progress__fill"
                            style={{ width: `${modPercent}%` }}
                          />
                        </div>
                        <span className="lp-progress__text">
                          {modCompleted}/{modTotal}
                        </span>
                      </div>
                      {mod.status !== 'locked' && (
                        <button className="lpd-module__btn">
                          {mod.status === 'completed' ? '复习' : '继续'}
                          <ArrowRight size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Objectives Tab */}
        {activeTab === 'objectives' && (
          <div className="lpd-objectives">
            <div className="cd-card">
              <h3 className="cd-card-title">
                <Target size={18} />
                学习目标
              </h3>
              <ul className="lpd-objective-list">
                {path.objectives.map((obj, idx) => (
                  <li key={idx} className="lpd-objective-item">
                    <span className="lpd-objective-num">{idx + 1}</span>
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Knowledge Graph Tab */}
        {activeTab === 'graph' && (
          <div className="lpd-graph-section">
            <div className="cd-card">
              <h3 className="cd-card-title">
                <Layers size={18} />
                知识点图谱
              </h3>
              <p className="lpd-graph-desc">
                以下展示了本路径涉及的所有知识点，模块之间存在前置依赖关系。
              </p>
              <div className="lpd-graph">
                {path.modules.map((mod, idx) => (
                  <div key={mod.id} className="lpd-graph-node-wrapper">
                    {idx > 0 && <div className="lpd-graph-arrow" />}
                    <div
                      className={`lpd-graph-node lpd-graph-node--${mod.status}`}
                    >
                      <span className="lpd-graph-node__title">{mod.name}</span>
                      <div className="lpd-graph-node__kp">
                        {mod.knowledgePoints.map((kp) => (
                          <span key={kp} className="lp-kp-tag lp-kp-tag--sm">
                            {kp}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="lpd-graph-legend">
                <div className="lpd-legend-item">
                  <span className="lpd-legend-dot lpd-legend-dot--completed" />
                  已完成
                </div>
                <div className="lpd-legend-item">
                  <span className="lpd-legend-dot lpd-legend-dot--in_progress" />
                  进行中
                </div>
                <div className="lpd-legend-item">
                  <span className="lpd-legend-dot lpd-legend-dot--locked" />
                  未解锁
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
