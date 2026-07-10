import { useState, useEffect, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Trophy,
  Clock,
  Users,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Medal,
  Target,
  CheckCircle2,
  XCircle,
  Minus,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { contestService } from '@/services';
import { useToast } from '@/hooks/useToast';
import type { Contest, ContestStanding } from '@/types';
import './ContestDetail.css';

export default function ContestDetail() {
  const { id } = useParams<{ id: string }>();
  const contestId = id ?? '';

  const [contest, setContest] = useState<Contest | null>(null);
  const [standings, setStandings] = useState<ContestStanding[]>([]);
  const [loading, setLoading] = useState(true);
  const [standingsLoading, setStandingsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'problems' | 'ranking'>('overview');
  const [timeLeft, setTimeLeft] = useState(0);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const { error: showError } = useToast();

  const fetchContest = useCallback(async () => {
    if (!contestId) return;
    setLoading(true);
    try {
      const data = await contestService.getContestById(contestId);
      setContest(data);
      // Calculate time left if running
      if (data.status === 'running') {
        const end = new Date(data.endTime).getTime();
        const now = Date.now();
        setTimeLeft(Math.max(0, Math.floor((end - now) / 1000)));
      }
    } catch {
      showError('加载竞赛详情失败');
    } finally {
      setLoading(false);
    }
  }, [contestId, showError]);

  const fetchStandings = useCallback(async () => {
    if (!contestId) return;
    setStandingsLoading(true);
    try {
      const data = await contestService.getContestStandings(contestId);
      setStandings(data);
      setLastRefresh(new Date());
    } catch {
      showError('加载排行榜失败');
    } finally {
      setStandingsLoading(false);
    }
  }, [contestId, showError]);

  useEffect(() => {
    fetchContest();
  }, [fetchContest]);

  useEffect(() => {
    if (activeTab === 'ranking' || activeTab === 'overview') {
      fetchStandings();
    }
  }, [activeTab, fetchStandings]);

  // Countdown timer
  useEffect(() => {
    if (!contest || contest.status !== 'running') return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [contest]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const formatMinutes = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const getDurationSeconds = (start: string, end: string) => {
    return Math.floor((new Date(end).getTime() - new Date(start).getTime()) / 1000);
  };

  const handleRefresh = () => {
    fetchStandings();
  };

  if (loading) {
    return (
      <div className="contest-detail-page">
        <div className="container">
          <div className="cd-loading">
            <Loader2 size={32} className="cl-loading-spinner" />
            <p>加载中...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!contest) {
    return (
      <div className="contest-detail-page">
        <div className="container">
          <div className="cd-loading">
            <Trophy size={48} />
            <p>竞赛不存在</p>
            <Link to="/contests" className="cd-back">
              <ChevronLeft size={18} />
              返回竞赛列表
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const durationSeconds = getDurationSeconds(contest.startTime, contest.endTime);
  const problems = contest.problems || [];

  return (
    <div className="contest-detail-page">
      <div className="container">
        {/* Header */}
        <div className="cd-header">
          <Link to="/contests" className="cd-back">
            <ChevronLeft size={18} />
            返回竞赛列表
          </Link>
        </div>

        {/* Contest Info */}
        <div className="cd-info">
          <div className="cd-info-left">
            <div className="cd-status">
              <span className={`status-dot status-dot--${contest.status}`} />
              {contest.status === 'running' ? '进行中' : contest.status === 'upcoming' ? '即将开始' : '已结束'}
            </div>
            <h1 className="cd-title">{contest.title}</h1>
            <p className="cd-desc">{contest.description}</p>
            <div className="cd-meta">
              <span className="cd-meta-item">
                <Calendar size={14} />
                {new Date(contest.startTime).toLocaleString('zh-CN')}
              </span>
              <span className="cd-meta-item">
                <Clock size={14} />
                时长 {formatMinutes(Math.floor(durationSeconds / 60))}
              </span>
              <span className="cd-meta-item">
                <Target size={14} />
                {contest.problemCount} 道题目
              </span>
              <span className="cd-meta-item">
                <Users size={14} />
                {contest.participantCount.toLocaleString()} 人参赛
              </span>
            </div>
          </div>

          {/* Timer */}
          {contest.status === 'running' && (
            <div className="cd-timer">
              <div className="cd-timer-label">距离结束</div>
              <div className="cd-timer-value">{formatTime(timeLeft)}</div>
              <div className="cd-timer-bar">
                <div
                  className="cd-timer-fill"
                  style={{ width: `${(timeLeft / durationSeconds) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="cd-tabs">
          <button
            className={`cd-tab ${activeTab === 'overview' ? 'cd-tab--active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            概览
          </button>
          <button
            className={`cd-tab ${activeTab === 'problems' ? 'cd-tab--active' : ''}`}
            onClick={() => setActiveTab('problems')}
          >
            题目
          </button>
          <button
            className={`cd-tab ${activeTab === 'ranking' ? 'cd-tab--active' : ''}`}
            onClick={() => setActiveTab('ranking')}
          >
            排行榜
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="cd-content">
            <div className="cd-overview-grid">
              {/* Problem Overview */}
              <div className="cd-card">
                <h3 className="cd-card-title">
                  <Target size={18} />
                  题目概览
                </h3>
                {problems.length > 0 ? (
                  <div className="cd-problem-list">
                    {problems.map((p) => (
                      <div key={p.id} className="cd-problem-item">
                        <span className="cd-problem-order">{p.label}</span>
                        <div className="cd-problem-info">
                          <span className="cd-problem-name">{p.problem?.title || `题目 ${p.label}`}</span>
                          {p.problem?.difficulty && (
                            <span className={`difficulty-badge difficulty-badge--${p.problem.difficulty}`}>
                              {p.problem.difficulty === 'easy' ? '简单' : p.problem.difficulty === 'medium' ? '中等' : '困难'}
                            </span>
                          )}
                        </div>
                        <div className="cd-problem-stats">
                          <span className="cd-problem-solved">
                            <CheckCircle2 size={14} />
                            {p.points} 分
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="cd-empty-text">暂无题目信息</p>
                )}
              </div>

              {/* Top 5 */}
              <div className="cd-card">
                <h3 className="cd-card-title">
                  <Trophy size={18} />
                  实时排名 Top 5
                </h3>
                {standingsLoading ? (
                  <div className="cd-card-loading">
                    <Loader2 size={20} className="cl-loading-spinner" />
                  </div>
                ) : standings.length > 0 ? (
                  <>
                    <div className="cd-top-list">
                      {standings.slice(0, 5).map((entry) => (
                        <div key={entry.rank} className="cd-top-item">
                          <div className={`cd-top-rank cd-top-rank--${entry.rank <= 3 ? entry.rank : 'other'}`}>
                            {entry.rank <= 3 ? <Medal size={16} /> : entry.rank}
                          </div>
                          <span className="cd-top-name">{entry.username}</span>
                          <span className="cd-top-score">{entry.score}</span>
                          <span className="cd-top-time">{formatMinutes(entry.penalty)}</span>
                        </div>
                      ))}
                    </div>
                    <button
                      className="cd-card-link"
                      onClick={() => setActiveTab('ranking')}
                    >
                      查看完整排行榜 <ChevronRight size={14} />
                    </button>
                  </>
                ) : (
                  <p className="cd-empty-text">暂无排名数据</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'problems' && (
          <div className="cd-content">
            <div className="cd-card">
              <h3 className="cd-card-title">
                <Target size={18} />
                竞赛题目
              </h3>
              {problems.length > 0 ? (
                <div className="cd-problem-table-wrapper">
                  <table className="cd-problem-table">
                    <thead>
                      <tr>
                        <th>编号</th>
                        <th>题目</th>
                        <th>难度</th>
                        <th>分值</th>
                        <th>操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {problems.map((p) => (
                        <tr key={p.id}>
                          <td className="cd-pt-order">{p.label}</td>
                          <td className="cd-pt-title">{p.problem?.title || `题目 ${p.label}`}</td>
                          <td>
                            {p.problem?.difficulty && (
                              <span className={`difficulty-badge difficulty-badge--${p.problem.difficulty}`}>
                                {p.problem.difficulty === 'easy' ? '简单' : p.problem.difficulty === 'medium' ? '中等' : '困难'}
                              </span>
                            )}
                          </td>
                          <td className="cd-pt-rate">{p.points} 分</td>
                          <td>
                            <Link to={`/problems/${p.problemId}`} className="cd-pt-link">
                              <ExternalLink size={14} />
                              做题
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="cd-empty-text">暂无题目信息</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'ranking' && (
          <div className="cd-content">
            <div className="cd-card">
              <div className="cd-ranking-header">
                <h3 className="cd-card-title">
                  <Trophy size={18} />
                  实时排行榜
                </h3>
                <div className="cd-ranking-actions">
                  <span className="cd-refresh-time">
                    最后更新: {lastRefresh.toLocaleTimeString('zh-CN')}
                  </span>
                  <button className="cd-refresh-btn" onClick={handleRefresh} disabled={standingsLoading}>
                    <RefreshCw size={14} className={standingsLoading ? 'cl-loading-spinner' : ''} />
                    刷新
                  </button>
                </div>
              </div>

              {standingsLoading && standings.length === 0 ? (
                <div className="cd-card-loading">
                  <Loader2 size={24} className="cl-loading-spinner" />
                  <p>加载排行榜...</p>
                </div>
              ) : standings.length > 0 ? (
                <div className="cd-ranking-wrapper">
                  <table className="cd-ranking-table">
                    <thead>
                      <tr>
                        <th className="cd-rh-rank">排名</th>
                        <th className="cd-rh-user">选手</th>
                        <th className="cd-rh-score">总分</th>
                        <th className="cd-rh-time">罚时</th>
                        {problems.map((p) => (
                          <th key={p.id} className="cd-rh-problem">{p.label}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {standings.map((entry) => (
                        <tr key={entry.rank} className="cd-rank-row">
                          <td className="cd-rd-rank">
                            <div className="cd-rank-badge-wrap">
                              <span className={`cd-rank-badge cd-rank-badge--${entry.rank <= 3 ? entry.rank : 'other'}`}>
                                {entry.rank}
                              </span>
                            </div>
                          </td>
                          <td className="cd-rd-user">
                            <span className="cd-rd-username">{entry.username}</span>
                          </td>
                          <td className="cd-rd-score">{entry.score}</td>
                          <td className="cd-rd-time">{entry.penalty}</td>
                          {entry.problems.map((pr, idx) => (
                            <td key={idx} className="cd-rd-problem">
                              {pr.status === 'solved' && (
                                <div className="cd-pr-solved">
                                  <CheckCircle2 size={14} />
                                  {pr.time != null && <span className="cd-pr-time">{pr.time}m</span>}
                                  {pr.attempts > 1 && (
                                    <span className="cd-pr-attempts">(-{pr.attempts - 1})</span>
                                  )}
                                </div>
                              )}
                              {pr.status === 'attempted' && (
                                <div className="cd-pr-failed">
                                  <XCircle size={14} />
                                  <span className="cd-pr-attempts">(-{pr.attempts})</span>
                                </div>
                              )}
                              {pr.status === 'none' && (
                                <Minus size={14} className="cd-pr-none" />
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="cd-empty-text">暂无排名数据</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
