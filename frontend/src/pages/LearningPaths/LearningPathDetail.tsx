import { useState, useEffect, useCallback } from 'react';
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
import {
  getLearningPathDetail,
  type LearningPathDetail as PathDetailType,
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

const problemDifficultyLabels: Record<number, string> = {
  1: '简单',
  2: '简单',
  3: '中等',
  4: '困难',
  5: '困难',
};

const problemDifficultyClasses: Record<number, string> = {
  1: 'easy',
  2: 'easy',
  3: 'medium',
  4: 'hard',
  5: 'hard',
};

export default function LearningPathDetail() {
  const { id } = useParams();
  const [path, setPath] = useState<PathDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'modules' | 'objectives' | 'graph'>('modules');

  const fetchPathDetail = useCallback(async (pathId: string) => {
    try {
      setLoading(true);
      const data = await getLearningPathDetail(pathId);
      setPath(data);
      setError(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch learning path detail';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (id) {
      fetchPathDetail(id);
    }
  }, [id, fetchPathDetail]);

  if (loading) {
    return (
      <div className="lp-page">
        <div className="container">
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
          <Link to="/paths" className="lp-back">
            <ChevronLeft size={18} />
            返回学习路径
          </Link>
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={() => id && fetchPathDetail(id)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              重试
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!path) {
    return (
      <div className="lp-page">
        <div className="container">
          <Link to="/paths" className="lp-back">
            <ChevronLeft size={18} />
            返回学习路径
          </Link>
          <div className="text-center py-12">
            <p className="text-gray-500">学习路径不存在</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="lp-page">
      <div className="container">
        {/* Back */}
        <Link to="/paths" className="lp-back">
          <ChevronLeft size={18} />
          返回学习路径
        </Link>

        {/* Path Header */}
        <div className="lpd-header">
          <div className="lpd-header__left">
            <span className={`lp-diff lp-diff--${difficultyClasses[path.difficulty]}`}>
              {difficultyLabels[path.difficulty]}
            </span>
            <h1 className="lpd-title">{path.title}</h1>
            <p className="lpd-desc">{path.description}</p>
            <div className="lpd-meta">
              <span className="lp-meta-item">
                <Clock size={14} />
                预计 {path.estimatedHours} 小时
              </span>
              <span className="lp-meta-item">
                <Layers size={14} />
                {path.totalModules} 个模块
              </span>
              <span className="lp-meta-item">
                <BookOpen size={14} />
                {path.totalProblems} 道题目
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
                  strokeDashoffset={`${2 * Math.PI * 52 * (1 - path.progressPercent / 100)}`}
                />
              </svg>
              <div className="lpd-ring-text">
                <span className="lpd-ring-value">{path.progressPercent}%</span>
                <span className="lpd-ring-label">完成</span>
              </div>
            </div>
            <div className="lpd-progress-stats">
              <div className="lpd-pstat">
                <CheckCircle2 size={14} />
                <span>{path.completedModules}/{path.totalModules} 模块</span>
              </div>
              <div className="lpd-pstat">
                <Target size={14} />
                <span>{path.completedProblems}/{path.totalProblems} 题目</span>
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
              const modPercent = mod.totalCount > 0
                ? Math.round((mod.completedCount / mod.totalCount) * 100)
                : 0;

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
                    {mod.status === 'not_started' && (
                      <Lock size={24} className="lpd-step-icon lpd-step-icon--locked" />
                    )}
                  </div>

                  {/* Module content */}
                  <div className="lpd-module__content">
                    <div className="lpd-module__header">
                      <div>
                        <span className="lpd-module__index">模块 {idx + 1}</span>
                        <h3 className="lpd-module__title">{mod.title}</h3>
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
                    {mod.knowledgePoints.length > 0 && (
                      <div className="lpd-module__kp">
                        {mod.knowledgePoints.map((kp) => (
                          <span key={kp} className="lp-kp-tag">
                            {kp}
                          </span>
                        ))}
                      </div>
                    )}

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
                            className={`difficulty-badge difficulty-badge--${problemDifficultyClasses[prob.difficulty]}`}
                          >
                            {problemDifficultyLabels[prob.difficulty]}
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
                          {mod.completedCount}/{mod.totalCount}
                        </span>
                      </div>
                      {mod.status !== 'not_started' && (
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
                      <span className="lpd-graph-node__title">{mod.title}</span>
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
