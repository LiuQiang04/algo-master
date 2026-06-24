import { useState, useEffect, useCallback } from 'react';
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
import {
  getLearningPaths,
  type LearningPathSummary,
} from '../../services/learningPaths';
import './LearningPaths.css';

const difficultyLabels: Record<number, string> = {
  1: '入门',
  2: '进阶',
  3: '高级',
  4: '专家',
  5: '大师',
};

const difficultyClasses: Record<number, string> = {
  1: 'beginner',
  2: 'intermediate',
  3: 'advanced',
  4: 'advanced',
  5: 'advanced',
};

export default function LearningPaths() {
  const [paths, setPaths] = useState<LearningPathSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchPaths = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getLearningPaths();
      setPaths(data);
      setError(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch learning paths';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPaths();
  }, [fetchPaths]);

  const filteredPaths = paths.filter((p) => {
    const matchesDifficulty =
      difficultyFilter === 'all' || p.difficulty.toString() === difficultyFilter;
    const matchesSearch =
      searchQuery === '' ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDifficulty && matchesSearch;
  });

  const getProgressPercent = (path: LearningPathSummary) =>
    path.totalModules > 0
      ? Math.round((path.completedModules / path.totalModules) * 100)
      : 0;

  const getTotalStats = () => ({
    pathCount: paths.length,
    moduleCount: paths.reduce((s, p) => s + p.totalModules, 0),
    completedCount: paths.reduce((s, p) => s + p.completedModules, 0),
  });

  const stats = getTotalStats();

  if (loading) {
    return (
      <div className="lp-page">
        <div className="container">
          <div className="lp-header">
            <div>
              <h1 className="lp-title">学习路径</h1>
              <p className="lp-desc">
                按照系统化的路径学习算法，循序渐进地提升你的编程能力
              </p>
            </div>
          </div>
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="lp-page">
        <div className="container">
          <div className="lp-header">
            <div>
              <h1 className="lp-title">学习路径</h1>
              <p className="lp-desc">
                按照系统化的路径学习算法，循序渐进地提升你的编程能力
              </p>
            </div>
          </div>
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={fetchPaths}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              重试
            </button>
          </div>
        </div>
      </div>
    );
  }

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
              <span className="lp-stat-value">{stats.pathCount}</span>
              <span className="lp-stat-label">条路径</span>
            </div>
            <div className="lp-stat">
              <span className="lp-stat-value">{stats.moduleCount}</span>
              <span className="lp-stat-label">个模块</span>
            </div>
            <div className="lp-stat">
              <span className="lp-stat-value">{stats.completedCount}</span>
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
            {(['all', '1', '2', '3'] as const).map((level) => (
              <button
                key={level}
                className={`lp-chip ${difficultyFilter === level ? 'lp-chip--active' : ''}`}
                onClick={() => setDifficultyFilter(level)}
              >
                {level === 'all' ? '全部' : difficultyLabels[Number(level)]}
              </button>
            ))}
          </div>
        </div>

        {/* Path Grid */}
        <div className="lp-grid">
          {filteredPaths.map((path) => {
            const percent = getProgressPercent(path);
            return (
              <Link
                key={path.id}
                to={`/paths/${path.id}`}
                className="lp-card"
              >
                <div className="lp-card__icon">
                  {difficultyClasses[path.difficulty] === 'beginner'
                    ? 'DS'
                    : difficultyClasses[path.difficulty] === 'intermediate'
                      ? 'DP'
                      : 'Graph'}
                </div>
                <div className="lp-card__body">
                  <div className="lp-card__top">
                    <span
                      className={`lp-diff lp-diff--${difficultyClasses[path.difficulty]}`}
                    >
                      {difficultyLabels[path.difficulty]}
                    </span>
                    {percent === 100 && (
                      <span className="lp-completed-badge">
                        <CheckCircle2 size={14} /> 已完成
                      </span>
                    )}
                  </div>
                  <h3 className="lp-card__title">{path.title}</h3>
                  <p className="lp-card__desc">{path.description}</p>

                  <div className="lp-card__meta">
                    <span className="lp-meta-item">
                      <Clock size={14} />
                      {path.estimatedHours} 小时
                    </span>
                    <span className="lp-meta-item">
                      <Layers size={14} />
                      {path.totalModules} 模块
                    </span>
                    <span className="lp-meta-item">
                      <CheckCircle2 size={14} />
                      {path.completedModules}/{path.totalModules}
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
